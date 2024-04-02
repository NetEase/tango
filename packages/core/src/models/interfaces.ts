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
} from '../types';
import { TangoFile, TangoJsonFile } from './file';
import { TangoRouteModule } from './route-module';
import { TangoStoreModule } from './store-module';
import { TangoServiceModule } from './service-module';
import { IdGenerator } from '../helpers';

export interface IViewFile {
  readonly workspace: IWorkspace;
  readonly filename: string;
  readonly type: FileType;

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

  removeNode: (targetNodeId: string) => IViewFile;

  insertChild: (
    targetNodeId: string,
    newNode: any,
    position?: InsertChildPositionType,
  ) => IViewFile;

  insertAfter: (targetNodeId: string, newNode: any) => IViewFile;

  insertBefore: (targetNodeId: string, newNode: any) => IViewFile;

  replaceNode: (targetNodeId: string, newNode: any) => IViewFile;

  replaceViewChildren: (rawNodes: any[]) => IViewFile;

  updateNodeAttribute: (
    nodeId: string,
    attrName: string,
    attrValue?: any,
    relatedImports?: string[],
  ) => IViewFile;

  updateNodeAttributes: (
    nodeId: string,
    config: Record<string, any>,
    relatedImports?: string[],
  ) => IViewFile;

  get code(): string;
  get nodes(): Map<string, IViewNode>;
  get nodesTree(): object[];
  get tree(): any;
}

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

export interface IWorkspace {
  history: TangoHistory;
  selectSource: SelectSource;
  dragSource: DragSource;

  files: Map<string, TangoFile>;
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

  updateFile: (filename: string, code: string, shouldFormatCode?: boolean) => void;

  listFiles: () => Record<string, string>;
  getFile: (filename: string) => TangoFile;

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
  get activeViewModule(): IViewFile;
  get pages(): any[];
  get bizComps(): string[];
  get baseComps(): string[];
  get localComps(): string[];
}
