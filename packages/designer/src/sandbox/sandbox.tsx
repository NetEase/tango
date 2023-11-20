import React, { useImperativeHandle, ForwardedRef, useRef, useState, useEffect } from 'react';
import { Box } from 'coral-system';
import { CodeSandbox, CodeSandboxProps } from '@music163/tango-sandbox';
import { getValue, isFunction, logger, pick, setValue } from '@music163/tango-helpers';
import { observer, useWorkspace, useDesigner } from '@music163/tango-context';
import { Simulator, Viewport } from '../simulator';
import { useSandboxQuery } from '../context';
import { DndQuery, useDnd } from '../dnd';
import { Navigator } from './navigator';
import { SelectionToolsProps } from '../simulator/selection';

interface ISandboxEventHandlerConfig {
  sandboxQuery?: DndQuery;
  sandboxType?: 'design' | 'preview';
  isActive: boolean;
  [x: string]: any;
}

export type SandboxProps = Omit<CodeSandboxProps, 'files' | 'eventHandlers' | 'onMessage'> & {
  isPreview?: boolean;
  selectionTools?: SelectionToolsProps['actions'];
  /**
   * tangoConfigJson 处理器
   */
  configFormatter?: IMergeTangoConfigJsonConfig['formatter'];
  sandboxType?: 'design' | 'preview';
  mode?: 'single' | 'combined';
  injectScript?: string;
  onViewChange?: (data: any, config?: ISandboxEventHandlerConfig) => void;
  onMessage?: (data: any, config?: ISandboxEventHandlerConfig) => void;
  onLoad?: (config?: ISandboxEventHandlerConfig) => void;
};

export interface CombinedSandboxRef {
  designSandbox: CodeSandbox;
  previewSandbox: CodeSandbox;
}

const LANDING_PAGE_PATH = '/__background_landing_page__';

function useSandbox({
  isPreview: isPreviewProp,
  configFormatter,
  onViewChange,
  onMessage: onMessageProp,
  onLoad: onLoadProp,
  sandboxType,
  startRoute,
  injectScript,
}: SandboxProps = {}): CodeSandboxProps & { display: string } {
  const workspace = useWorkspace();
  const designer = useDesigner();
  const sandboxQuery = useSandboxQuery();
  const isPreview = isPreviewProp ?? designer.isPreview;

  // 组件不一定会立即刷新，因此 isActive 需要实时获取
  const getIsActive = () => isPreview === designer.isPreview;
  const isActive = getIsActive();

  const getSandboxConfig = () => ({
    sandboxQuery,
    isPreview,
    isActive: getIsActive(),
    sandboxType,
  });

  const dndHandlers = useDnd({
    sandboxQuery,
    workspace,
    designer,
    onViewChange: (data) => onViewChange && onViewChange(data, getSandboxConfig()),
  });

  let files = Array.from(workspace.files.keys()).reduce((prev, filename) => {
    let code = workspace.getFile(filename).code;
    if (filename === '/tango.config.json') {
      code = mergeTangoConfigJson(code, { isPreview, injectScript, formatter: configFormatter });
    }
    prev[filename] = { code };
    return prev;
  }, {});
  files = fixSandboxFiles(files, workspace.entry);

  const onMessage = (data: any) => onMessageProp && onMessageProp(data, getSandboxConfig());
  const onLoad = () => onLoadProp && onLoadProp(getSandboxConfig());

  // 根据当前 workspace 状态与组件传入的状态是否一致，控制是否需要切换到空白路由
  const display = isActive ? 'block' : 'none';
  const routePath = isActive ? startRoute || workspace.activeRoute : LANDING_PAGE_PATH;

  const sandboxProps = isPreview
    ? {
        files,
        eventHandlers: pick(dndHandlers, ['onTango']),
        onMessage,
        display,
        startRoute: routePath,
        onLoad,
      }
    : {
        files,
        eventHandlers: dndHandlers as any,
        onMessage,
        display,
        startRoute: routePath,
        onLoad,
      };

  return sandboxProps;
}

const PreviewSandbox = observer(
  (props: SandboxProps, ref: ForwardedRef<CodeSandbox>) => {
    const { onViewChange, onMessage, startRoute, isPreview = true, injectScript, ...rest } = props;
    const { display, ...sandboxProps } = useSandbox({
      isPreview,
      onViewChange,
      onMessage,
      startRoute,
      injectScript,
      sandboxType: 'preview',
      ...rest,
    });

    return (
      <Box display={display} width="100%" height="100%">
        <CodeSandbox ref={ref} iframeId="preview-sandbox-container" {...sandboxProps} {...rest} />
      </Box>
    );
  },
  {
    forwardRef: true,
  },
);
PreviewSandbox.displayName = 'PreviewSandbox';

const DesignSandbox = observer(
  (props: SandboxProps, ref: ForwardedRef<CodeSandbox>) => {
    const { onViewChange, onMessage, startRoute, isPreview = false, injectScript, ...rest } = props;
    const workspace = useWorkspace();
    const { display, ...sandboxProps } = useSandbox({
      isPreview,
      onViewChange,
      onMessage: (data, config) => {
        if (onMessage) {
          onMessage(data, config);
        }

        const { sandboxQuery } = config;

        const sandboxRendered = ['success', 'resize'].includes(data.type);

        // 根据代码更新情况重设选中元素的外框
        if (sandboxRendered && workspace.selectSource.isSelected) {
          const items = workspace.selectSource.selected.map((item) => {
            const element = sandboxQuery.getElementBySlotId(item.id);
            if (element) {
              const bounding = sandboxQuery.getElementBounding(element);
              item.bounding = bounding;
              item.element = element;
            }
            return item;
          });
          workspace.selectSource.select(items);
        }
      },
      startRoute,
      injectScript,
      sandboxType: 'design',
      ...rest,
    });

    return (
      <Box display={display} width="100%" height="100%">
        <CodeSandbox ref={ref} {...sandboxProps} {...rest} />
      </Box>
    );
  },
  {
    forwardRef: true,
  },
);

export const CombinedSandbox = observer(
  (
    { onViewChange: onViewChangeProp, ...rest }: SandboxProps,
    ref: ForwardedRef<CombinedSandboxRef>,
  ) => {
    const workspace = useWorkspace();
    const designer = useDesigner();
    const designSandboxRef = useRef<CodeSandbox>();
    const previewSandboxRef = useRef<CodeSandbox>();
    const routePath = useRef<string>();
    const activeSandbox = useRef<string>();
    const [startRoute, setStartRoute] = useState(workspace.activeRoute);

    const onViewChange = (data: any, config: ISandboxEventHandlerConfig) => {
      if (config.isActive) {
        const curPath = data?.pathname + data?.search;
        const isSandboxChanged = config.sandboxType !== activeSandbox.current;

        // 沙箱从 inactive -> active，通过跳转回上一页把 landing page pop 出去
        // onViewChange 似乎被 memo 了？useCallback 不生效，使用 ref 存储当前的 sandbox 类型
        if (isSandboxChanged) {
          const curSandbox = config.isPreview
            ? previewSandboxRef.current
            : designSandboxRef.current;
          if (curSandbox) {
            try {
              // 当 sandbox 状态变为 active 时，此事件后于 isPreview 触发，sandbox 已经开始加载 startRoute
              // iframe 从 landing page 跳转到 startRoute，因此相较于切换前，历史记录多了 landing page 和 startRoute
              // 而在此事件中调用的 history.back() 晚于上述跳转的逻辑，所以 history.back() 实际是跳到 landing page
              // 但是如果不 history.back()，用户主动点击返回按钮，会进入 landing page，因为沙箱始终用 push
              //
              // 如果只后退一次，再 replace 到当前路由，其虽然消解了 landing page 的问题，但是会多出一个重复的前进路由
              // 因此回退两次，再 push 当前的路由，从而将之前沙箱内部的 push 销毁掉
              curSandbox.iframe.contentWindow.history.go(-2);
              // sandbox 切换 active 状态时，curPath 是切换时 sandbox 接受到的 startRoute prop
              // 而当时的 startRoute 还没变更（下面的 useEffect 注定晚于 isPreview 变更，所以 startRoute 还是之前的）
              // 因此 pop 路由时，取上一次 iframe 记录的 routePath
              curSandbox.iframe.contentWindow.history.pushState(null, null, routePath.current);
              curSandbox.iframe.contentWindow.dispatchEvent(new PopStateEvent('popstate'));
            } catch (err) {
              // 跨域？
              console.error(err);
            }
          }
        } else {
          // 如上所述，每次切换预览态时，sandbox 第一次抛出的 curPath 都是上一次 sandbox 的 startRoute，不应该记录
          routePath.current = curPath;
        }

        // 切换沙箱后，需要使用之前沙箱的路由
        activeSandbox.current = config.sandboxType;
      }

      if (onViewChangeProp) {
        onViewChangeProp(data, config);
      }
    };

    useEffect(() => {
      // 主动切换 activeRoute 时，需要重置沙箱的路由
      routePath.current = workspace.activeRoute;
      setStartRoute(workspace.activeRoute);
    }, [workspace.activeRoute]);

    // startRoute 只在切换 sandbox 时才重新设置，避免沙箱自行 pushState
    useEffect(() => {
      setStartRoute(routePath.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designer.isPreview]);

    useImperativeHandle(ref, () => ({
      designSandbox: designSandboxRef.current,
      previewSandbox: previewSandboxRef.current,
    }));

    return (
      <Box width="100%" height="100%">
        <DesignSandbox
          ref={designSandboxRef}
          onViewChange={onViewChange}
          startRoute={startRoute}
          {...rest}
        />
        <PreviewSandbox
          ref={previewSandboxRef}
          onViewChange={onViewChange}
          startRoute={startRoute}
          {...rest}
        />
      </Box>
    );
  },
  {
    forwardRef: true,
  },
);

export const Sandbox = observer(
  ({
    isPreview: isPreviewProp,
    selectionTools,
    bundlerURL,
    mode = 'combined',
    ...props
  }: SandboxProps) => {
    const bundlerUrl = bundlerURL ?? 'https://codesandbox.fn.netease.com';
    const lastScrollTopRef = useRef<number>();
    const sandboxRef = useRef<CodeSandbox>(null);
    const combinedSandboxRef = useRef<CombinedSandboxRef>(null);
    const navigatorRef = useRef<Navigator>(null);
    const workspace = useWorkspace();
    const designer = useDesigner();

    let sandbox = sandboxRef.current;
    if (mode === 'combined') {
      sandbox = designer.isPreview
        ? combinedSandboxRef.current?.previewSandbox
        : combinedSandboxRef.current?.designSandbox;
    }

    const onViewChange = (data: any, { isActive }: ISandboxEventHandlerConfig) => {
      if (isActive) {
        navigatorRef.current.changeRelativeUrl(data?.pathname + data?.search);
      }
    };
    const onMessage = (data: any, config: any = {}) => {
      const { sandboxQuery, isActive } = config;
      if (data.type === 'start' && isActive) {
        // 每次沙箱重新渲染前记住 iframe 内的 scrollTop
        lastScrollTopRef.current = sandboxQuery?.scrollTop;
      }
    };

    return (
      <Box className="SandboxContainer" height="100%">
        <Navigator
          ref={navigatorRef}
          disabled={!sandbox?.iframe}
          startRoute={workspace.activeRoute}
          onInputEnter={(newUrl) => {
            if (newUrl?.split('?')[0] === workspace.activeRoute) {
              // 只是输入了路由参数，默认为调试模式，直接更新沙箱内的路由地址
              sandbox?.updateRoute(newUrl);
            } else {
              // 如果是输入了其他路由，则直接跳转
              workspace.setActiveRoute(newUrl);
            }
          }}
          onBack={() => {
            sandbox?.manager.iframeProtocol.dispatch({ type: 'urlback' });
          }}
          onForward={() => {
            sandbox?.manager.iframeProtocol.dispatch({ type: 'urlforward' });
          }}
          onRefresh={() => {
            if (!sandbox) {
              return;
            }

            if (
              !canAccessIFrame(sandbox.iframe) ||
              sandbox.iframe.contentWindow.origin !== sandbox.props.bundlerURL
            ) {
              sandbox.iframe.src = `${bundlerUrl}${workspace.activeRoute}`;
            } else {
              sandbox.manager.iframeProtocol.dispatch({ type: 'refresh' });
            }
            workspace.selectSource.clear();
          }}
        />
        <Simulator>
          <Viewport selectionTools={selectionTools}>
            {mode === 'single' && (
              <DesignSandbox
                ref={sandboxRef}
                template="create-react-app"
                bundlerURL={bundlerUrl}
                entry={workspace.entry}
                onViewChange={onViewChange}
                onMessage={onMessage}
                startRoute={workspace.activeRoute}
                isPreview={isPreviewProp ?? designer.isPreview}
                {...props}
              />
            )}
            {mode === 'combined' && (
              <CombinedSandbox
                ref={combinedSandboxRef}
                template="create-react-app"
                bundlerURL={bundlerUrl}
                entry={workspace.entry}
                onViewChange={onViewChange}
                onMessage={onMessage}
                {...props}
              />
            )}
          </Viewport>
        </Simulator>
      </Box>
    );
  },
);

// 兼容 tango.config.json，转成 sandbox.config.json
function fixSandboxFiles(files: Record<string, { code: string }>, entry = '/src/index.js') {
  if (files['/tango.config.json']) {
    const tangConfigJsonStr = files['/tango.config.json'].code;
    const tangConfigJson = JSON.parse(tangConfigJsonStr);
    files['/sandbox.config.json'] = {
      code: JSON.stringify(tangConfigJson.sandbox, null, 2),
    };
  }

  if (!files['/index.html']) {
    files['/index.html'] = {
      code: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" href="data:image/ico;base64,aWNv">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Vite App</title>
          </head>
          <body>
            <div id="root" />
            <script type="module" src="${entry}"></script>
          </body>
        </html>
      `,
    };
  }
  return files;
}

interface IMergeTangoConfigJsonConfig {
  isPreview?: boolean;
  injectScript?: string;
  formatter?: (json: object) => object;
}

function mergeTangoConfigJson(
  code: string,
  { isPreview, injectScript, formatter }: IMergeTangoConfigJsonConfig = {},
) {
  let json;
  try {
    json = JSON.parse(code);
  } catch (err) {
    logger.error('Json parse failed!', err);
    return code;
  }

  const userJs = getValue(json, 'sandbox.evaluateJavaScript') || '';
  let mergedUserJs = userJs;

  if (injectScript) {
    mergedUserJs = `${mergedUserJs};${injectScript}`;
  }

  if (userJs !== mergedUserJs) {
    setValue(json, 'sandbox.evaluateJavaScript', mergedUserJs);
  }

  // 合并 packages 内的信息至 sandbox
  const packages = getValue(json, 'packages');
  const externals = getValue(json, 'sandbox.externals') || {};
  const externalResources = getValue(json, 'sandbox.externalResources') || [];
  const newExternalResources = getValue(json, 'externalResources') || [];
  if (packages) {
    // 追加 umd 资源，并替换 url 中的 token，如版本号等
    const pushExternalResources = (list: string[], tokenMap?: { [x: string]: any }) => {
      const result = list.map((item) =>
        item.replace(/{{(.*?)}}/g, (matched, token) => {
          return tokenMap?.[token] || matched;
        }),
      );
      externalResources.push(...result);
    };
    // 追加 externals
    const pushExternals = (name: string, library?: string) => {
      if (library) {
        externals[name] = library;
      }
    };

    Object.keys(packages).forEach((name) => {
      const item = packages[name];
      // 如果是设计态，且拥有设计器资源，则使用设计器资源，否则使用默认资源
      if (item.designerResources && !isPreview) {
        pushExternalResources(item.designerResources, {
          name,
          version: item.version,
        });
        pushExternals(name, item.library);
      } else if (item.resources) {
        pushExternalResources(item.resources, {
          name,
          version: item.version,
        });
        pushExternals(name, item.library);
      }
    });
  }
  if (newExternalResources?.length) {
    externalResources.push(...newExternalResources);
  }
  setValue(json, 'sandbox.externals', externals);
  setValue(json, 'sandbox.externalResources', [...new Set(externalResources)]);

  if (isFunction(formatter)) {
    json = formatter?.(json);
  }

  return JSON.stringify(json);
}

function canAccessIFrame(iframe: HTMLIFrameElement) {
  let html = null;
  try {
    // deal with older browsers
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    html = doc.body.innerHTML;
  } catch (err) {
    // do nothing
  }
  return html !== null;
}
