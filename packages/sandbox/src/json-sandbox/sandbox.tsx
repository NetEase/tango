import React, { useRef } from 'react';

export interface JsonSandboxProps {
  /**
   * 文件列表
   */
  files?: Record<string, string>;
  /**
   * 事件监听器
   */
  eventHandlers?: Record<string, Function>;
  /**
   * 组件包的 umd 全局变量名
   */
  componentsPackageGlobalName?: string;
  /**
   * Json 渲染器的地址
   */
  jsonRendererUrl: string;
}

export function JsonSandbox({
  files,
  eventHandlers,
  componentsPackageGlobalName,
  jsonRendererUrl,
}: JsonSandboxProps) {
  const rendererRef = useRef<any>();
  const schemaData = JSON.parse(files['/src/pages/index.schema.json']);
  const tangoConfig = JSON.parse(files['/tango.config.json']);

  const mountContent = async (frame: HTMLIFrameElement) => {
    if (!frame) {
      return;
    }

    if (!rendererRef.current) {
      const renderer = await buildHtml(frame, {
        schemaData,
        eventHandlers,
        externalResources: tangoConfig?.sandbox?.externalResources || [],
        jsonRendererUrl,
      });

      /**
       * 避免在 await 期间 rendererRef.current 发生了变化
       * @see https://eslint.org/docs/latest/rules/require-atomic-updates#properties
       */
      if (!rendererRef.current) {
        rendererRef.current = renderer;
      }
    }

    rendererRef.current.run('root', (window: Window) => {
      return {
        tree: schemaData,
        components: window[componentsPackageGlobalName],
      };
    });
  };

  return (
    <iframe
      style={{
        width: '100%',
        height: '100%',
        border: 0,
      }}
      ref={async (frame) => await mountContent(frame)}
    />
  );
}

type BuildHtmlOptions = {
  /**
   * 渲染数据
   */
  schemaData: any;
  /**
   * 外置的资源包
   */
  externalResources?: string[];
} & Pick<JsonSandboxProps, 'eventHandlers' | 'jsonRendererUrl'>;

async function buildHtml(
  iframe: HTMLIFrameElement,
  { schemaData, eventHandlers, externalResources, jsonRendererUrl }: BuildHtmlOptions,
) {
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  win['schemaData'] = schemaData;

  const styles: string[] = [];
  const scripts: string[] = [];

  externalResources.forEach((resource) => {
    if (resource.endsWith('.css')) {
      styles.push(resource);
    } else if (resource.endsWith('.js')) {
      scripts.push(resource);
    }
  });

  const styleTags = styles.reduce((acc, style) => {
    return `${acc}<link rel="stylesheet" href="${style}" />`;
  }, '');
  const scriptTags = scripts.reduce((acc, script) => {
    return `${acc}<script src="${script}"></script>`;
  }, '');

  doc.open();
  doc.write(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Json Sandbox</title>
    ${styleTags}
  </head>
  <body>
    <div id="root"></div>
    ${scriptTags}
    <script src="${jsonRendererUrl}"></script>
  </body>
</html>`);
  doc.close();

  Object.keys(eventHandlers || {}).forEach((key) => {
    doc[key.toLowerCase()] = eventHandlers[key];
  });

  return new Promise((resolve) => {
    const renderer = win['jsonSandboxRenderer'];
    if (renderer) {
      return resolve(renderer);
    }
    const loaded = () => {
      resolve(win['jsonSandboxRenderer']);
      win.removeEventListener('load', loaded);
    };
    win.addEventListener('load', loaded);
  });
}
