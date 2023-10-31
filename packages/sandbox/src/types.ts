export interface IFile {
  code: string;
}

export interface IFiles {
  [path: string]: IFile;
}

export interface EventHandlers {
  [path: string]: (e: Event) => void;
}

export interface IModule {
  code: string;
  path: string;
}

export interface IDependencies {
  [depName: string]: string;
}

export interface IModuleSource {
  fileName: string;
  compiledCode: string;
  sourceMap: Object | undefined;
}

export interface IModuleError {
  title: string;
  message: string;
  path: string;
  line: number;
  column: number;
}

export interface ITranspiledModule {
  module: IModule;
  query: string;
  source: IModuleSource | undefined;
  assets: {
    [name: string]: IModuleSource;
  };
  isEntry: boolean;
  isTestFile: boolean;
  childModules: string[];
  /**
   * All extra modules emitted by the loader
   */
  emittedAssets: IModuleSource[];
  initiators: string[];
  dependencies: string[];
  asyncDependencies: string[];
  transpilationDependencies: string[];
  transpilationInitiators: string[];
}

export interface IManagerState {
  entry: string;
  transpiledModules: {
    [id: string]: ITranspiledModule;
  };
}

export interface ISandpackContext {
  browserFrame: HTMLIFrameElement | null;
  managerStatus: ManagerStatus;
  managerState: IManagerState | undefined;
  bundlerURL: string | undefined;
  browserPath: string;
  openedPath: string;
  errors: IModuleError[];
  files: IFiles;
  openFile: (path: string) => void;
  updateFiles: (files: IFiles) => void;
  getManagerTranspilerContext: () => Promise<{ [transpiler: string]: Object }>;
}

export type ManagerStatus =
  | 'initializing'
  | 'installing-dependencies'
  | 'transpiling'
  | 'evaluating'
  | 'running-tests'
  | 'idle';

export interface SandpackBundlerFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

export type SandpackBundlerFiles = Record<string, SandpackBundlerFile>;

export interface Module {
  code: string;
  path: string;
}

export type Modules = Record<
  string,
  {
    code: string;
    path: string;
  }
>;

export type Dependencies = Record<string, string>;

export type ReactDevToolsMode = 'latest' | 'legacy';

export interface ModuleSource {
  fileName: string;
  compiledCode: string;
  sourceMap: unknown | undefined;
}

export enum SandpackLogLevel {
  None = 0,
  Error = 10,
  Warning = 20,
  Info = 30,
  Debug = 40,
}

export interface ErrorStackFrame {
  columnNumber: number;
  fileName: string;
  functionName: string;
  lineNumber: number;
  _originalColumnNumber: number;
  _originalFileName: string;
  _originalFunctionName: string;
  _originalLineNumber: number;
  _originalScriptCode: Array<{
    lineNumber: number;
    content: string;
    highlight: boolean;
  }>;
}

export interface TranspiledModule {
  module: Module;
  query: string;
  source: ModuleSource | undefined;
  assets: Record<string, ModuleSource>;
  isEntry: boolean;
  isTestFile: boolean;
  childModules: string[];
  /**
   * All extra modules emitted by the loader
   */
  emittedAssets: ModuleSource[];
  initiators: string[];
  dependencies: string[];
  asyncDependencies: string[];
  transpilationDependencies: string[];
  transpilationInitiators: string[];
}

export interface BundlerState {
  entry: string;
  transpiledModules: Record<string, TranspiledModule>;
}

export type ClientStatus =
  | 'initializing'
  | 'installing-dependencies'
  | 'transpiling'
  | 'evaluating'
  | 'running-tests'
  | 'idle';

export type ListenerFunction = (msg: SandpackMessage) => void;
export type UnsubscribeFunction = () => void;

export type Listen = (listener: ListenerFunction, clientId?: string) => UnsubscribeFunction;
export type Dispatch = (msg: SandpackMessage, clientId?: string) => void;

export interface SandpackError {
  message: string;
  line?: number;
  column?: number;
  path?: string;
  title?: string;
}

export interface SandpackErrorMessage {
  title: string;
  path: string;
  message: string;
  line: number;
  column: number;
  payload: {
    frames?: ErrorStackFrame[];
  };
}

export type SandpackMessageConsoleMethods =
  | 'log'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'table'
  | 'clear'
  | 'time'
  | 'timeEnd'
  | 'count'
  | 'assert';

export interface BaseSandpackMessage {
  type: string;
  $id?: number;
  codesandbox?: boolean;
}

export interface BaseProtocolMessage {
  type: string;
  msgId: string;
}

export interface ProtocolErrorMessage extends BaseProtocolMessage {
  error: {
    message: string;
  };
}

export interface ProtocolResultMessage extends BaseProtocolMessage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
}

export interface ProtocolRequestMessage extends BaseProtocolMessage {
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[];
}

export interface NpmRegistry {
  enabledScopes: string[];
  limitToScopes: boolean;
  registryUrl: string;
  /**
   * It must be `false` if you're providing a sef-host solution,
   * otherwise, it'll try to proxy from CodeSandbox Proxy
   */
  proxyEnabled: boolean;
  registryAuthToken?: string;
}

type TestStatus = 'running' | 'pass' | 'fail';

export type TestError = Error & {
  matcherResult?: boolean;
  mappedErrors?: Array<{
    fileName: string;
    _originalFunctionName: string;
    _originalColumnNumber: number;
    _originalLineNumber: number;
    _originalScriptCode: Array<{
      lineNumber: number;
      content: string;
      highlight: boolean;
    }> | null;
  }>;
};

export interface Test {
  name: string;
  blocks: string[];
  status: TestStatus;
  path: string;
  errors: TestError[];
  duration?: number | undefined;
}

export type SandboxTestMessage =
  | RunAllTests
  | RunTests
  | ClearJestErrors
  | ({ type: 'test' } & (
      | InitializedTestsMessage
      | TestCountMessage
      | TotalTestStartMessage
      | TotalTestEndMessage
      | AddFileMessage
      | RemoveFileMessage
      | FileErrorMessage
      | DescribeStartMessage
      | DescribeEndMessage
      | AddTestMessage
      | TestStartMessage
      | TestEndMessage
    ));

interface InitializedTestsMessage {
  event: 'initialize_tests';
}

interface ClearJestErrors {
  type: 'action';
  action: 'clear-errors';
  source: 'jest';
  path: string;
}

interface TestCountMessage {
  event: 'test_count';
  count: number;
}

interface TotalTestStartMessage {
  event: 'total_test_start';
}

interface TotalTestEndMessage {
  event: 'total_test_end';
}

interface AddFileMessage {
  event: 'add_file';
  path: string;
}

interface RemoveFileMessage {
  event: 'remove_file';
  path: string;
}

interface FileErrorMessage {
  event: 'file_error';
  path: string;
  error: TestError;
}

interface DescribeStartMessage {
  event: 'describe_start';
  blockName: string;
}

interface DescribeEndMessage {
  event: 'describe_end';
}

interface AddTestMessage {
  event: 'add_test';
  testName: string;
  path: string;
}

interface TestStartMessage {
  event: 'test_start';
  test: Test;
}

interface TestEndMessage {
  event: 'test_end';
  test: Test;
}

interface RunAllTests {
  type: 'run-all-tests';
}

interface RunTests {
  type: 'run-tests';
  path: string;
}

export type SandpackMessage = BaseSandpackMessage &
  (
    | {
        type: 'initialized';
      }
    | {
        type: 'start';
        firstLoad?: boolean;
      }
    | {
        type: 'status';
        status: ClientStatus;
      }
    | {
        type: 'state';
        state: BundlerState;
      }
    | {
        type: 'success';
      }
    | ({
        type: 'action';
        action: 'show-error';
      } & SandpackErrorMessage)
    | {
        type: 'action';
        action: 'notification';
        notificationType: 'error';
        title: string;
      }
    | {
        type: 'done';
        compilatonError: boolean;
      }
    | {
        type: 'urlchange';
        url: string;
        back: boolean;
        forward: boolean;
      }
    | {
        type: 'resize';
        height: number;
      }
    | {
        type: 'transpiler-context';
        data: Record<string, Record<string, unknown>>;
      }
    | {
        type: 'compile';
        version: number;
        isInitializationCompile?: boolean;
        modules: Modules;
        externalResources: string[];
        hasFileResolver: boolean;
        disableDependencyPreprocessing?: boolean;
        template?: string;
        showOpenInCodeSandbox: boolean;
        showErrorScreen: boolean;
        showLoadingScreen: boolean;
        skipEval: boolean;
        clearConsoleDisabled?: boolean;
        reactDevTools?: ReactDevToolsMode;
        logLevel?: SandpackLogLevel;
        customNpmRegistries?: NpmRegistry[];
      }
    | {
        type: 'refresh';
      }
    | {
        type: 'urlback';
      }
    | {
        type: 'urlforward';
      }
    | {
        type: 'get-transpiler-context';
      }
    | {
        type: 'activate-react-devtools';
      }
    | {
        type: 'console';
        log: Array<{
          method: SandpackMessageConsoleMethods;
          id: string;
          data: string[];
        }>;
      }
    | SandboxTestMessage
  );

export type Template =
  | 'angular-cli'
  | 'create-react-app'
  | 'create-react-app-typescript'
  | 'svelte'
  | 'parcel'
  | 'vue-cli'
  | 'static'
  | 'solid';

export interface CodeSandboxState {
  errors: IModuleError[];
  status: ManagerStatus;
  loading: boolean;
  iframeId: string;
}

export interface CodeSandboxProps {
  files: IFiles;
  moduleType?: 'esm' | 'cjs';
  initialPath?: string;
  entry?: string;
  dependencies?: {
    [depName: string]: string;
  };
  bundlerURL?: string;
  skipEval?: boolean;
  template?: Template;
  externalResources?: string[];
  startRoute?: string;
  routerMode?: 'history' | 'hash';
  /**
   * iframe 唯一标识符，当有多个实例的时候必须要传
   */
  iframeId?: string;

  eventHandlers?: EventHandlers;
  onFileChange?: (files: IFiles, sandpack: ISandpackContext) => void;
  onMessage?: (data: any) => void;
  onLoad?: (frame: HTMLIFrameElement) => void;
  fileResolver?: {
    isFile: (path: string) => Promise<boolean>;
    readFile: (path: string) => Promise<string>;
  };
}

export interface ViteSandboxProps {
  files: IFiles;
  entry?: string;
  bundlerURL?: string;
  eventHandlers?: EventHandlers;
  startRoute?: string;
  routerMode?: 'history' | 'hash';
  onLoad?: () => void;
}
