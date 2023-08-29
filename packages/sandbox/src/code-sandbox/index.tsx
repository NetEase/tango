import React from 'react';
import { TangoEventName } from '@music163/tango-helpers';
import Loading from './loading';
import Manager from './manager';
import { createMissingPackageJSON, changeRoute } from './helper';
import { IFiles, CodeSandboxState, CodeSandboxProps, UnsubscribeFunction } from '../types';

// CodeSandbox 使用示例
// <CodeSandbox files={files} entry={entry} template={template} bundlerURL={`${window.location.protocol}//codesandbox.fn.netease.com/`} />
// 其中 files 示例如下：
// const files = {
//   "/package.json": {
//     code: JSON.stringify({ dependencies: {} }),
//   },
//   "/index.js": {
//     code: '',
//   },
//   "/index.less": {
//     code: lessCode,
//   },
// };
export class CodeSandbox extends React.Component<CodeSandboxProps, CodeSandboxState> {
  static defaultProps = {
    skipEval: false,
    eventHandlers: {},
    externalResources: [] as string[],
  };

  manager?: Manager;
  unsubscribeChannelListener: UnsubscribeFunction;

  iframe: HTMLIFrameElement;

  constructor(props: CodeSandboxProps) {
    super(props);

    this.state = {
      iframeId: props.iframeId || 'sandbox-container',
      errors: [],
      status: 'initializing',
      loading: true,
    };
  }

  componentDidUpdate(props: CodeSandboxProps) {
    // 如果文件内容、依赖、入口、模板其中任一发生变化，则调用 manager 实例重新构建页面
    if (
      props.files !== this.props.files ||
      props.dependencies !== this.props.dependencies ||
      props.entry !== this.props.entry ||
      props.template !== this.props.template
    ) {
      const newFiles = createMissingPackageJSON(
        this.props.files,
        this.props.dependencies,
        this.props.entry,
      );

      this.updateFiles(newFiles);
    }

    if (props.startRoute !== this.props.startRoute) {
      this.updateRoute(this.props.startRoute);
    }

    if (this.manager && this.props.skipEval !== props.skipEval) {
      this.manager.updateOptions(this.getOptions());
    }
  }

  componentWillUnmount() {
    // clear listener
    this.unsubscribeChannelListener();
    this.manager.cleanup();

    // clear tango event
    if (this.iframe && this.props?.eventHandlers?.onTango) {
      this.iframe.contentDocument?.removeEventListener(
        TangoEventName.DesignerAction,
        this.props.eventHandlers.onTango,
      );
    }
  }

  updateRoute = (route: string) => {
    changeRoute(this.iframe, route, this.props.routerMode);
  };

  handleMessage = (m: any) => {
    if (m.type === 'state') {
      // this.setState({ managerState: m.state });
    } else if (m.type === 'start') {
      this.setState({ errors: [] });
    } else if (m.type === 'status') {
      this.setState({ status: m.status });
    } else if (m.type === 'action' && m.action === 'show-error') {
      const { title, path, message, line, column } = m;
      this.setState((state) => ({
        errors: [...state.errors, { title, path, message, line, column }],
      }));
    } else if (m.type === 'success') {
      this.setState({ loading: false });
    } else if (m.type === 'done') {
      this.setState({ loading: false });
    }
    if (this.props.onMessage) {
      this.props.onMessage(m);
    }
  };

  getOptions = () => ({
    bundlerURL: this.props.bundlerURL,
    fileResolver: this.props.fileResolver,
    skipEval: this.props.skipEval,
    externalResources: this.props.externalResources,
  });

  // Manager 实例化，即开始构建页面
  // 将 el 传给 Manager 作为实例化参数，当构建完成后，会将构建的页面 dom 设置给 el
  // 注：Manager是一个管理者的角色，从大局上把控整个转译和执行的流程
  // setupFrame 是作为 iframe 标签的 ref 回调函数，
  // ref 回调会在 componentDidMount 或 componentDidUpdate 这些生命周期回调之前执行，
  // 当给 HTML 元素添加 ref 属性时，ref 回调接收了底层的 DOM 元素作为参数
  setupFrame = (el: HTMLIFrameElement) => {
    if (el) {
      this.iframe = el;

      this.manager = new Manager(
        el,
        {
          files: createMissingPackageJSON(
            this.props.files,
            this.props.dependencies,
            this.props.entry,
          ),
          template: this.props.template,
          showOpenInCodeSandbox: false,
        },
        this.getOptions(),
      );

      this.unsubscribeChannelListener = this.manager.iframeProtocol.channelListen(
        this.handleMessage,
      );

      el.onload = () => {
        // 修改 domain，以便让外部页面和 iframe 页面在同一个域名下，主要目的是为了直接监听 iframe 页面的事件
        document.domain = window.location.hostname.split('.').slice(-2).join('.');

        // 执行沙箱页面加载后的回调函数
        if (this.props.onLoad) {
          this.props.onLoad(el);
        }

        // 注册监听函数
        const { eventHandlers } = this.props;
        Object.keys(eventHandlers).forEach((eventType) => {
          if (el.contentDocument) {
            el.contentDocument[eventType.toLowerCase()] = eventHandlers[eventType];
          }
          if (eventType === 'onTango') {
            el.contentDocument?.addEventListener(
              TangoEventName.DesignerAction,
              eventHandlers[eventType],
            );
          }
        });
      };
    }
  };

  // 如果文件内容发生变化，则调用 manager 实例重新构建页面
  updateFiles = (files: IFiles) => {
    if (this.manager) {
      this.manager.updatePreview({
        showOpenInCodeSandbox: false,
        files,
        template: this.props.template,
      });
    }
  };

  render() {
    const { loading, status, iframeId } = this.state;
    return (
      <div className="CodeSandbox" style={{ position: 'relative', height: '100%' }}>
        {loading ? <Loading status={status} /> : null}
        <iframe
          ref={this.setupFrame}
          title="sandpack-sandbox"
          id={iframeId}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            outline: 0,
          }}
          src={this.props.bundlerURL}
        />
      </div>
    );
  }
}
