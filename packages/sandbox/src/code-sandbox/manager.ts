import isEqual from 'lodash.isequal';
import { IFrameProtocol } from './iframe-protocol';
import { createMissingPackageJSON } from './helper';
import {
  IManagerState,
  IModuleError,
  ManagerStatus,
  UnsubscribeFunction,
  SandpackMessage,
} from '../types';

interface IManagerOptions {
  /**
   * Location of the bundler.
   */
  bundlerURL?: string;
  /**
   * Width of iframe.
   */
  width?: string;
  /**
   * Height of iframe.
   */
  height?: string;
  /**
   * If we should skip the third step: evaluation.
   */
  skipEval?: boolean;

  externalResources?: string[];

  /**
   * You can pass a custom file resolver that is responsible for resolving files.
   * We will use this to get all files from the file system.
   */
  fileResolver?: {
    isFile: (path: string) => Promise<boolean>;
    readFile: (path: string) => Promise<string>;
  };
}

interface IFile {
  code: string;
}

interface IFiles {
  [path: string]: IFile;
}

interface IModules {
  [path: string]: {
    code: string;
    path: string;
  };
}

interface IDependencies {
  [depName: string]: string;
}

interface ISandboxInfo {
  files: IFiles;
  dependencies?: IDependencies;
  entry?: string;
  /**
   * What template we use, if not defined we infer the template from the dependencies or files.
   *
   * @type {string}
   */
  template?: string;

  showOpenInCodeSandbox?: boolean;

  /**
   * Only use unpkg for fetching the dependencies, no preprocessing. It's slower, but doesn't talk
   * to AWS.
   */
  disableDependencyPreprocessing?: boolean;
}

const BUNDLER_URL =
  process.env.CODESANDBOX_ENV === 'development'
    ? 'http://localhost:3002'
    : `https://sandpack-0-0-66.codesandbox.io`;

export default class PreviewManager {
  selector: string | undefined;
  element: Element;
  iframe: HTMLIFrameElement;
  iframeProtocol: IFrameProtocol;
  options: IManagerOptions;
  id: string | null = null;
  listener?: Function;
  bundlerURL: string;
  externalResources: string[];
  managerState: IManagerState | undefined;
  errors: IModuleError[];
  status: ManagerStatus;

  sandboxInfo: ISandboxInfo;

  unsubscribeGlobalListener: UnsubscribeFunction;
  unsubscribeChannelListener: UnsubscribeFunction;

  constructor(
    selector: string | HTMLIFrameElement,
    sandboxInfo: ISandboxInfo,
    options: IManagerOptions = {},
  ) {
    this.options = options;
    this.sandboxInfo = sandboxInfo;
    this.bundlerURL = options.bundlerURL || BUNDLER_URL;
    this.externalResources = options.externalResources || [];
    this.managerState = undefined;
    this.errors = [];
    this.status = 'initializing';

    if (typeof selector === 'string') {
      this.selector = selector;
      const element = document.querySelector(selector);

      if (!element) {
        throw new Error(`No element found for selector '${selector}'`);
      }

      this.element = element;
      this.iframe = document.createElement('iframe');
      this.initializeElement();
    } else {
      this.element = selector;
      this.iframe = selector;
    }
    // this.iframe.setAttribute(
    //   'sandbox',
    //   'allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts',
    // );

    this.iframeProtocol = new IFrameProtocol(this.iframe, this.bundlerURL);

    this.unsubscribeGlobalListener = this.iframeProtocol.globalListen((mes: SandpackMessage) => {
      if (mes.type !== 'initialized' || !this.iframe.contentWindow) {
        return;
      }

      this.iframeProtocol.register();

      this.updatePreview();
    });

    this.unsubscribeChannelListener = this.iframeProtocol.channelListen((mes: SandpackMessage) => {
      switch (mes.type) {
        case 'start': {
          this.errors = [];
          break;
        }
        case 'status': {
          this.status = mes.status;
          break;
        }
        case 'action': {
          if (mes.action === 'show-error') {
            const { title, path, message, line, column } = mes;
            this.errors = [...this.errors, { title, path, message, line, column }];
          }
          break;
        }
        case 'state': {
          this.managerState = mes.state;
          break;
        }
        default:
          break;
      }
    });
  }

  updateOptions(options: IManagerOptions) {
    if (!isEqual(this.options, options)) {
      this.options = options;
      this.updatePreview();
    }
  }

  updatePreview(sandboxInfo = this.sandboxInfo) {
    this.sandboxInfo = sandboxInfo;

    const files = this.getFiles();

    const modules: IModules = Object.keys(files).reduce(
      (prev, next) => ({
        ...prev,
        [next]: {
          code: files[next].code,
          path: next,
        },
      }),
      {},
    );

    // 将构建所需要的数据例如源代码等，传递给 iframe，
    // iframe 中加载的打包逻辑监听到 compile 类型消息后，
    // 开始基于传递过来的数据进行构建
    this.dispatch({
      type: 'compile',
      codesandbox: true,
      version: 3,
      modules,
      clearConsoleDisabled: true,
      externalResources: this.externalResources,
      hasFileResolver: false,
      disableDependencyPreprocessing: this.sandboxInfo.disableDependencyPreprocessing,
      template: this.sandboxInfo.template,
      showOpenInCodeSandbox:
        this.sandboxInfo.showOpenInCodeSandbox == null
          ? true
          : this.sandboxInfo.showOpenInCodeSandbox,
      showErrorScreen: true,
      showLoadingScreen: true,
      skipEval: this.options.skipEval || false,
    });
  }

  cleanup(): void {
    this.unsubscribeChannelListener();
    this.unsubscribeGlobalListener();
    this.iframeProtocol.cleanup();
  }

  private dispatch(message: SandpackMessage) {
    this.iframeProtocol.dispatch(message);
  }

  private getFiles() {
    const { sandboxInfo } = this;

    if (sandboxInfo.files['/package.json'] === undefined) {
      return createMissingPackageJSON(
        sandboxInfo.files,
        sandboxInfo.dependencies,
        sandboxInfo.entry,
      );
    }

    return this.sandboxInfo.files;
  }

  private initializeElement() {
    this.iframe.style.border = '0';
    this.iframe.style.width = this.options.width || '100%';
    this.iframe.style.height = this.options.height || '100%';
    this.iframe.style.overflow = 'hidden';

    if (!this.element.parentNode) {
      // This should never happen
      throw new Error('Given element does not have a parent.');
    }

    // 用 iframe 替换 element
    this.element.parentNode.replaceChild(this.iframe, this.element);
  }
}
