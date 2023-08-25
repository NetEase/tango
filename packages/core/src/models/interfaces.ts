import { ComponentPrototypeType, Dict } from '@music163/tango-helpers';
import { TangoHistory } from './history';
import { SelectSource } from './select-source';
import { DragSource } from './drag-source';
import {
  FileItemType,
  FileType,
  ImportDeclarationPayloadType,
  InsertChildPositionType,
  PackageConfigType,
  PageConfigType,
  ProjectDataType,
  ServiceFunctionPayloadType,
} from '../types/types';
import { TangoFile, TangoJsonFile } from './file';
import { TangoRouteModule, TangoServiceModule, TangoStoreModule } from './module';

export interface IViewFile {
  readonly workspace: IWorkspace;
  readonly filename: string;
  readonly type: FileType;

  /**
   * 通过导入组件名查找组件来自的包
   */
  importMap?: Dict<{ package: string; isDefault?: boolean }>;

  update: (code?: string, isFormatCode?: boolean, refreshWorkspace?: boolean) => void;

  getNode: (targetNodeId: string) => IViewNode;

  removeNode: (targetNodeId: string) => IViewFile;

  insertChild: (
    targetNodeId: string,
    newNode: any,
    position?: InsertChildPositionType,
    sourcePrototype?: string | ComponentPrototypeType,
  ) => IViewFile;

  insertAfter: (targetNodeId: string, newNode: any, sourcePrototype?: string | ComponentPrototypeType) => IViewFile;

  insertBefore: (targetNodeId: string, newNode: any, sourcePrototype?: string | ComponentPrototypeType) => IViewFile;

  replaceNode: (targetNodeId: string, newNode: any, sourcePrototype?: string | ComponentPrototypeType) => IViewFile;

  replaceViewChildren: (rawNodes: any[], importDeclarations?: ImportDeclarationPayloadType[]) => IViewFile;

  updateNodeAttribute: (nodeId: string, attrName: string, attrValue?: any, relatedImports?: string[]) => IViewFile;

  updateNodeAttributes: (nodeId: string, config: Record<string, any>, relatedImports?: string[]) => IViewFile;

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
   * @returns
   */
  cloneRawNode: () => unknown;

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
  componentPrototypes: Map<string, ComponentPrototypeType>;

  entry: string;
  activeFile: string;
  activeViewFile: string;
  activeRoute: string;

  tangoConfigJson: TangoJsonFile;
  routeModule?: TangoRouteModule;
  serviceModule?: TangoServiceModule;

  refresh: (names: string[]) => void;
  ready: () => void;

  setActiveRoute: (path: string) => void;
  setActiveFile: (filename: string) => void;

  setComponentPrototypes: (prototypes: Record<string, ComponentPrototypeType>) => void;
  getPrototype: (name: string | ComponentPrototypeType) => ComponentPrototypeType;

  /**
   * 获取项目数据
   */
  getProjectData?: () => ProjectDataType;

  /**
   * 查询节点
   * @param id 节点 ID
   * @param module 节点所在的模块名
   * @returns 返回节点对象
   */
  getNode: (id: string, module?: string) => IViewNode;
  listModals?: () => Array<{ label: string; value: string }>;
  listForms?: () => Record<string, string[]>;

  addFile: (filename: string, code: string, fileType?: FileType) => void;
  addFiles: (files: FileItemType[]) => void;
  updateFile: (filename: string, code: string, shouldFormatCode?: boolean) => void;
  removeFile: (filename: string) => void;
  renameFile: (oldFilename: string, newFilename: string) => void;
  getFile: (filename: string) => TangoFile;
  listFiles: () => Record<string, string>;

  addViewPage: (name: string, code: string) => void;

  removeSelectedNode: () => void;

  cloneSelectedNode: () => void;

  copySelectedNode: () => void;

  pasteSelectedNode: () => void;

  insertToSelectedNode: (childNameOrPrototype: string | ComponentPrototypeType) => void;

  dropNode: () => void;

  insertToNode: (targetNodeId: string, sourceNameOrPrototype: string | ComponentPrototypeType) => void;

  replaceNode: (targetNodeId: string, sourceNameOrPrototype: string | ComponentPrototypeType) => void;

  updateSelectedNodeAttributes: (attributes: Record<string, any>, relatedImports?: string[]) => void;

  addBlock?: (files: object, name: string) => void;

  generateBlockFilesBySelectedNode?: () => Record<string, string>;

  removeServiceFunction?: (serviceName: string) => void;

  addServiceFunction?: (payload: ServiceFunctionPayloadType | ServiceFunctionPayloadType[]) => void;

  updateServiceFunction?: (payload: any) => void;

  updateServiceBaseConfig?: (name: string, value: any) => void;

  listStoreModules?: () => TangoStoreModule[];

  addStoreModule?: (storeName: string, code: string) => void;

  removeStoreModule?: (storeName: string) => void;

  addStoreState?: (storeName: string, stateName: string, initValue: string) => void;

  removeStoreState?: (storeName: string, stateName: string) => void;

  updateModuleCodeByVariablePath?: (variablePath: string, code: string) => void;

  removeViewModule: (routePath: string) => void;

  copyViewPage: (sourceRoutePath: string, targetPageData: PageConfigType) => void;

  updateRoute: (sourceRoutePath: string, targetPageData: PageConfigType) => void;

  listDependencies?: () => any;

  updateDependency?: (
    name: string,
    version: string,
    options?: {
      package?: PackageConfigType;
      [x: string]: any;
    },
  ) => void;

  removeDependency?: (name: string) => void;

  addBizComp?: (
    name: string,
    version: string,
    options?: {
      package?: PackageConfigType;
      [x: string]: any;
    },
  ) => void;

  removeBizComp?: (name: string) => void;

  get activeViewModule(): IViewFile;
  // TODO: -> getStoreModules
  get storeModules(): TangoStoreModule[];
  // TODO: -> getPages
  get pages(): any[];
  // TODO: getBizComps
  get bizComps(): string[];
  // TODO: getBaseComps
  get baseComps(): string[];
  // TODO: getBlocks
  get blocks(): any[];
}
