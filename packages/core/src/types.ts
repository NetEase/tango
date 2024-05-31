import { JSXElement } from '@babel/types';

export type SimulatorMode = 'desktop' | 'tablet' | 'phone';

/**
 * 文件类型枚举
 */
export enum FileType {
  // js 文件
  Module = 'module',
  AppEntryModule = 'appEntryModule',
  StoreEntryModule = 'storeEntryModule',
  RouteModule = 'routeModule',
  ServiceModule = 'serviceModule',
  StoreModule = 'storeModule',

  // 组件配置文件
  ComponentPrototypeModule = 'componentPrototypeModule',
  // 组件运行调试入口文件，一般为 `/app.js`
  ComponentDemoEntryModule = 'componentDemoEntryModule',
  /**
   * 本地组件目录的入口文件
   */
  ComponentsEntryModule = 'componentsEntryModule',
  /**
   * @deprecated 已废弃
   */
  BlockEntryModule = 'blockEntryModule',

  // jsx 类型视图文件
  JsxViewModule = 'jsxViewModule',
  // json 类型视图文件
  JsonViewModule = 'jsonViewModule',

  // 非 js 文件
  PackageJson = 'packageJson',
  TangoConfigJson = 'tangoConfigJson',
  AppJson = 'appJson',
  File = 'file',
  Json = 'json',
  Less = 'less',
  Scss = 'scss',
}

export interface IFileConfig {
  /**
   * 文件名
   */
  filename: string;
  /**
   * 原始代码
   */
  code: string;
  /**
   * 文件类型
   */
  type?: FileType;
}

/**
 * 视图节点数据类型
 */
export interface ITangoViewNodeData<T = JSXElement> {
  /**
   * 节点 ID
   */
  id: string;
  /**
   * 代码中的 ID
   */
  codeId?: string;
  /**
   * 父亲节点的 ID
   */
  parentId: string;
  /**
   * 父节点中的 tid
   */
  parentCodeId?: string;
  /**
   * 组件名
   */
  component: string;
  /**
   * 组件的属性集合
   */
  props?: Record<string, any>;
  /**
   * 原始的 ast 节点
   */
  rawNode?: T;
  /**
   * 子节点列表
   */
  children?: Array<ITangoViewNodeData<T>>;
}

/**
 * 导出变量数据
 */
export interface IExportSpecifierData {
  /**
   * 来源
   */
  source: string;
  /**
   * exported name
   */
  exportedName: string;
  /**
   * local name
   */
  localName?: string;
}

/**
 * 导入变量的来源
 */
export interface IImportSpecifierSourceData {
  source: string;
  isDefault?: boolean;
}

/**
 * 解析的导入变量数据
 */
export interface IImportSpecifierData {
  /**
   * 导入名
   */
  importedName?: string;
  /**
   * 本地名
   */
  localName: string;
  /**
   * 类型
   */
  type: 'ImportDefaultSpecifier' | 'ImportSpecifier' | 'ImportNamespaceSpecifier';
}

/**
 * 解析的导入语句数据
 */
export type ImportDeclarationDataType = Record<string, IImportSpecifierData[]>;

/**
 * 模块导入的参数类型
 * @deprecated 使用 IImportSpecifierData 代替
 */
export interface IImportDeclarationPayload {
  defaultSpecifier?: string;
  specifiers?: string[];
  sourcePath: string;
}

/**
 * Store 属性类型
 */
export interface IStorePropertyData {
  /**
   * 属性名
   */
  name: string;
  /**
   * 对应的源码
   */
  code?: string;
  /**
   * codemirror 中对应的类型
   * @see https://codemirror.net/6/docs/ref/#autocomplete
   */
  type?:
    | 'class'
    | 'constant'
    | 'enum'
    | 'function'
    | 'interface'
    | 'keyword'
    | 'method'
    | 'namespace'
    | 'property'
    | 'text'
    | 'type'
    | 'variable'
    | 'object';
}

/**
 * 路由解析数据
 */
export interface IRouteData {
  /**
   * 路由
   */
  path: string;
  /**
   * 组件名
   */
  component?: string;
  /**
   * 导入路径
   */
  importPath?: string;
  [key: string]: any;
}

/**
 * 页面配置数据
 */
export interface IPageConfigData {
  /**
   * 路由
   */
  path: string;
  /**
   * 父菜单路由
   */
  parentPath?: string;
  /**
   * 页面标题
   */
  name?: string;
  /**
   * 权限码
   */
  privilegeCode?: string;
}

/**
 * 项目数据
 */
export interface IProjectData {
  /**
   * 页面列表
   */
  pages: Array<{
    title?: string;
    filename: string;
    path?: string;
    includes?: { variables: string[] };
  }>;
  /**
   * 模型列表
   */
  stores: {
    [key: string]: {
      filename: string;
    };
  };
  /**
   * 服务列表
   */
  services: {
    [key: string]: {
      filename: string;
      functions: string[];
    };
  };
}

export type InsertChildPositionType = 'first' | 'last';

/**
 * tango.config.json 中 packages 定义
 */
export interface ITangoConfigPackages {
  /**
   * 依赖类型
   */
  type?: 'baseDependency' | 'bizDependency' | 'dependency';
  /**
   * 版本号
   */
  version?: string;
  /**
   * umd 资源全局变量名
   */
  library?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 基础包 umd 资源
   */
  resources?: string[];
  /**
   * 设计态 umd 资源
   */
  designerResources?: string[];
}
