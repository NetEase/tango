import { IComponentPrototype, Dict, ITangoConfigJson } from '@music163/tango-helpers';
import { TangoHistory } from './history';
import { SelectSource } from './select-source';
import { DragSource } from './drag-source';
import {
  IFileConfig,
  FileType,
  InsertChildPositionType,
  ITangoConfigPackages,
  IPageConfigData,
  IImportSpecifierSourceData,
  IImportSpecifierData,
  IFileError,
} from '../types';
import { AbstractFile, TangoJsonFile } from './file';
import { TangoRouteModule } from './route-module';
import { TangoStoreModule } from './store-module';
import { TangoServiceModule } from './service-module';
import { IdGenerator } from '../helpers';
import { AppEntryModule } from './entry-module';

export interface IViewFile {
  /**
   * 文件名
   */
  filename: string;

  /**
   * ID 生成器
   */
  idGenerator: IdGenerator;

  /**
   * 通过导入组件名查找组件来自的包
   */
  importMap?: Dict<IImportSpecifierSourceData>;

  /**
   * 判断节点是否存在
   * @param codeId 节点 ID
   * @returns 存在返回 true，否则返回 false
   */
  hasNodeByCodeId?: (codeId: string) => boolean;

  listImportSources?: () => string[];
  listModals?: () => Array<{ label: string; value: string }>;
  listForms?: () => Record<string, string[]>;

  update: (code?: string, isFormatCode?: boolean, refreshWorkspace?: boolean) => void;

  /**
   * 添加新的导入符号
   * @param source 导入来源
   * @param newSpecifiers 新导入符号列表
   * @returns this
   */
  addImportSpecifiers: (source: string, newSpecifiers: IImportSpecifierData[]) => IViewFile;

  getNode: (targetNodeId: string) => IViewNode;

  removeNode: (targetNodeId: string) => this;

  insertChild: (targetNodeId: string, newNode: any, position?: InsertChildPositionType) => this;

  insertAfter: (targetNodeId: string, newNode: any) => this;

  insertBefore: (targetNodeId: string, newNode: any) => this;

  replaceNode: (targetNodeId: string, newNode: any) => this;

  replaceViewChildren: (rawNodes: any[]) => this;

  updateNodeAttribute: (
    nodeId: string,
    attrName: string,
    attrValue?: any,
    relatedImports?: string[],
  ) => this;

  updateNodeAttributes: (
    nodeId: string,
    config: Record<string, any>,
    relatedImports?: string[],
  ) => this;

  get nodes(): Map<string, IViewNode>;
  get nodesTree(): object[];
  get tree(): any;
  /**
   * 文件中的代码
   */
  get code(): string;
}

/**
 * @deprecated
 */
export interface IViewNode {
  /**
   * 所属的文件
   */
  file: IViewFile;

  /**
   * 节点 ID
   */
  readonly id: string;

  /**
   * 对应的组件
   */
  readonly component: string;

  /**
   * 原始节点对象
   */
  readonly rawNode: unknown;

  /**
   * 属性集合
   */
  readonly props: Record<string, any>;

  /**
   * 克隆原始节点
   * @param overrideProps 额外设置给克隆节点的属性
   * @returns
   */
  cloneRawNode: (overrideProps?: Dict) => unknown;

  /**
   * 销毁节点
   * @returns
   */
  destroy: () => void;

  /**
   * 原始节点的位置信息
   */
  get loc(): unknown;
}

/**
 * @deprecated 使用 AbstractWorkspace 代替
 */
export interface IWorkspace {
  history: TangoHistory;
  selectSource: SelectSource;
  dragSource: DragSource;

  files: Map<string, AbstractFile>;
  componentPrototypes: Map<string, IComponentPrototype>;

  entry: string;
  activeFile: string;
  activeViewFile: string;
  activeRoute: string;

  /**
   * 解析后的 tango.config.json 文件，如果要获取项目配置，推荐使用 projectConfig 获取
   */
  tangoConfigJson: TangoJsonFile;
  /**
   * app.js 入口文件解析后的模块
   */
  appEntryModule: AppEntryModule;
  /**
   * 解析后的路由模块
   */
  routeModule?: TangoRouteModule;
  /**
   * 解析后的状态管理模块 Map
   */
  storeModules?: Record<string, TangoStoreModule>;
  /**
   * 解析后的服务模块 Map
   */
  serviceModules?: Record<string, TangoServiceModule>;

  ready: () => void;
  refresh: (names: string[]) => void;

  setActiveRoute: (path: string) => void;
  setActiveFile: (filename: string) => void;

  setComponentPrototypes: (prototypes: Record<string, IComponentPrototype>) => void;
  getPrototype: (name: string | IComponentPrototype) => IComponentPrototype;

  // ----------------- 文件操作 -----------------
  addFiles: (files: IFileConfig[]) => void;
  addFile: (filename: string, code: string, fileType?: FileType) => void;

  addServiceFile: (serviceName: string, code: string) => void;
  addStoreFile: (storeName: string, code: string) => void;
  addViewFile: (viewName: string, code: string) => void;

  removeFile: (filename: string) => void;

  renameFile: (oldFilename: string, newFilename: string) => void;
  renameFolder: (oldFoldername: string, newFoldername: string) => void;

  /**
   * 更新文件
   * @param filename 文件名
   * @param code 代码
   * @param isSyncAst 是否同步 ast
   */
  updateFile: (filename: string, code: string, isSyncAst?: boolean) => void;

  /**
   * 检查并同步文件的 ast
   */
  syncFiles: () => void;

  listFiles: () => Record<string, string>;
  getFile: (filename: string) => AbstractFile;

  /**
   * 文件变化回调
   * @param filenames 文件名列表
   */
  onFilesChange: (filenames: string[]) => void;

  // ----------------- 节点操作 -----------------

  removeSelectedNode: () => void;
  cloneSelectedNode: () => void;
  copySelectedNode: () => void;
  pasteSelectedNode: () => void;
  insertToSelectedNode: (childNameOrPrototype: string | IComponentPrototype) => void;
  insertBeforeSelectedNode: (sourceNameOrPrototype: string | IComponentPrototype) => void;
  insertAfterSelectedNode: (sourceNameOrPrototype: string | IComponentPrototype) => void;
  dropNode: () => void;
  insertToNode: (targetNodeId: string, sourceNameOrPrototype: string | IComponentPrototype) => void;
  replaceNode: (targetNodeId: string, sourceNameOrPrototype: string | IComponentPrototype) => void;
  updateSelectedNodeAttributes: (
    attributes: Record<string, any>,
    relatedImports?: string[],
  ) => void;

  /**
   * 查询节点
   * @param id 节点 ID
   * @param module 节点所在的模块名
   * @returns 返回节点对象
   */
  getNode: (id: string, module?: string) => IViewNode;

  // ----------------- 服务函数文件操作 -----------------

  getServiceFunction?: (serviceKey: string) => {
    name: string;
    moduleName: string;
    config: Dict<object>;
  };
  listServiceFunctions?: () => Dict<object>;
  removeServiceFunction?: (serviceKey: string) => void;
  addServiceFunction?: (serviceName: string, config: Dict, modName?: string) => void;
  addServiceFunctions?: (configs: Dict<object>, modName?: string) => void;
  updateServiceFunction?: (serviceName: string, payload: Dict, modName?: string) => void;
  updateServiceBaseConfig?: (config: Dict, modName?: string) => void;

  // ----------------- 状态管理文件操作 -----------------
  addStoreState?: (storeName: string, stateName: string, initValue: string) => void;
  removeStoreModule?: (storeName: string) => void;
  removeStoreVariable?: (variablePath: string) => void;
  updateStoreVariable?: (variablePath: string, code: string) => void;

  // ----------------- 视图文件操作 -----------------

  removeViewModule: (routePath: string) => void;
  copyViewPage: (sourceRoutePath: string, targetPageData: IPageConfigData) => void;

  // ----------------- 路由文件操作 -----------------

  updateRoute: (sourceRoutePath: string, targetPageData: IPageConfigData) => void;

  // ----------------- 依赖包操作 -----------------

  addDependency?: (data: any) => void;
  listDependencies?: () => any;
  getDependency?: (pkgName: string) => object;

  updateDependency?: (
    name: string,
    version: string,
    options?: {
      package?: ITangoConfigPackages;
      [x: string]: any;
    },
  ) => void;

  removeDependency?: (name: string) => void;

  addBizComp?: (
    name: string,
    version: string,
    options?: {
      package?: ITangoConfigPackages;
      [x: string]: any;
    },
  ) => void;

  removeBizComp?: (name: string) => void;

  // ----------------- getter -----------------
  /**
   * 解析后的项目配置信息
   */
  get projectConfig(): ITangoConfigJson;
  /**
   * 当前活动的视图文件
   */
  get activeViewModule(): IViewFile;
  get pages(): any[];
  get bizComps(): string[];
  get baseComps(): string[];
  get localComps(): string[];
  get fileErrors(): IFileError[];
  /**
   * 是否是有效的项目
   * - 包含 tango.config.json
   * - 包含视图模块
   * - 没有文件错误
   */
  get isValid(): boolean;
}
