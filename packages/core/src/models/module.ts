import * as t from '@babel/types';
import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { clone, ComponentPrototypeType, Dict, isNil, logger } from '@music163/tango-helpers';
import {
  code2ast,
  ast2code,
  traverseRouteFile,
  traverseViewFile,
  traverseServiceFile,
  traverseStoreFile,
  traverseStoreEntryFile,
  addStoreToEntryFile,
  updateServiceConfigToServiceFile,
  removeJSXElement,
  insertSiblingAfterJSXElement,
  getModuleNameByFilename,
  addRouteToRouteFile,
  removeRouteFromRouteFile,
  appendChildToJSXElement,
  addImportDeclaration,
  updateImportDeclaration,
  deleteServiceConfigFromServiceFile,
  replaceJSXElement,
  formatCode,
  getImportDeclarationPayloadByPrototype,
  addStoreState,
  removeUnusedImportSpecifiers,
  insertSiblingBeforeJSXElement,
  updateStoreState,
  removeStoreState,
  removeStoreToEntryFile,
  replaceRootJSXElementChildren,
  updateRouteToRouteFile,
  updateBaseConfigToServiceFile,
  IdGenerator,
  updateJSXAttributes,
} from '../helpers';
import { TangoNode } from './node';
import { TangoFile } from './file';
import {
  RouteDataType,
  ModulePropsType,
  ClassPropertyNodeType,
  ServiceFunctionPayloadType,
  TangoViewNodeDataType,
  StorePropertyType,
  ImportDeclarationPayloadType,
  InsertChildPositionType,
} from '../types';
import { IViewFile, IWorkspace } from './interfaces';

/**
 * 模块实现规范
 * - ast 操纵类方法，统一返回 this，支持外层链式调用
 * - observable state 统一用 _foo 格式，并提供 getter 方法
 */
class TangoModule extends TangoFile {
  ast: t.File;

  constructor(workspace: IWorkspace, props: ModulePropsType, isSyncCode = true) {
    super(workspace, props, isSyncCode);
  }

  /**
   * 基于最新的 ast 进行同步
   * @param code 如果传入 code，则基于 code 进行同步
   * @param isFormatCode 是否格式化代码
   * @param refreshWorkspace 是否刷新 workspace
   */
  update(code?: string, isFormatCode = true, refreshWorkspace = true) {
    this.lastModified = Date.now();
    if (isNil(code)) {
      this._syncByAst();
    } else {
      this._syncByCode(code, isFormatCode);
    }

    this._analysisAst();

    if (refreshWorkspace) {
      this.workspace.refresh([this.filename]);
    }
  }

  /**
   * 基于最新的 ast 进行源码同步
   */
  _syncByAst() {
    const code = ast2code(this.ast);
    this._code = code;
    this._cleanCode = code;
  }

  /**
   * 基于输入的源码进行同步
   * @param code 源码
   * @param isFormatCode 是否格式化代码
   * @returns
   */
  _syncByCode(code: string, isFormatCode = true) {
    if (code === this._code) {
      return;
    }

    // 提前格式化代码
    if (isFormatCode) {
      code = formatCode(code);
    }

    this._code = code;
    this._cleanCode = code;
    this.ast = code2ast(code);
  }

  _analysisAst() {}
}

/**
 * 普通 JS 文件
 */
export class TangoJsModule extends TangoModule {
  constructor(workspace: IWorkspace, props: ModulePropsType) {
    super(workspace, props, false);
    this.update(props.code, false, false);

    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      code: computed,
      cleanCode: computed,
      update: action,
    });
  }
}

/**
 * 入口配置模块
 */
export class TangoStoreEntryModule extends TangoModule {
  _stores: string[] = [];

  get stores() {
    return toJS(this._stores);
  }

  constructor(workspace: IWorkspace, props: ModulePropsType) {
    super(workspace, props, false);
    this.update(props.code, true, false);

    makeObservable(this, {
      _stores: observable,
      _code: observable,
      _cleanCode: observable,
      stores: computed,
      code: computed,
      cleanCode: computed,
      update: action,
    });
  }

  _analysisAst() {
    this._stores = traverseStoreEntryFile(this.ast);
  }

  /**
   * 新建模型
   * @param name
   */
  addStore(name: string) {
    this.ast = addStoreToEntryFile(this.ast, name);
    return this;
  }

  /**
   * 删除模型
   * @param name
   */
  removeStore(name: string) {
    this.ast = removeStoreToEntryFile(this.ast, name);
    return this;
  }
}

/**
 * 路由配置模块
 */
export class TangoRouteModule extends TangoModule {
  _routes: RouteDataType[];

  get routes() {
    return toJS(this._routes);
  }

  constructor(workspace: IWorkspace, props: ModulePropsType) {
    super(workspace, props, false);
    this.update(props.code, true, false);

    makeObservable(this, {
      _routes: observable,
      _code: observable,
      _cleanCode: observable,
      routes: computed,
      code: computed,
      cleanCode: computed,
      update: action,
    });
  }

  /**
   * 根据路由地址获取 route 对象
   */
  getRouteByRoutePath(route: string) {
    let record;
    for (const item of this.routes) {
      if (item.path === route) {
        record = item;
        break;
      }
    }
    return record;
  }

  /**
   * 添加一条新路由
   * @param name
   */
  addRoute(routePath: string, importFilePath: string) {
    this.ast = addRouteToRouteFile(this.ast, routePath, importFilePath);
    return this;
  }

  /**
   * 更新页面路由
   * @param oldRoutePath
   * @param newRoutePath
   * @returns
   */
  updateRoute(oldRoutePath: string, newRoutePath: string) {
    this.ast = updateRouteToRouteFile(this.ast, oldRoutePath, newRoutePath);
    return this;
  }

  /**
   * 删除一条路由
   * @param route 路由地址
   */
  removeRoute(route: string) {
    if (route === '/') {
      console.warn('index route should not be removed!');
      return;
    }
    const record = this.getRouteByRoutePath(route);
    this.ast = removeRouteFromRouteFile(this.ast, route, record.importPath);
    return this;
  }

  _analysisAst() {
    this._routes = traverseRouteFile(this.ast);
  }
}

/**
 * 视图模块
 */
export class TangoViewModule extends TangoModule implements IViewFile {
  // 解析为树结构的 jsxNodes 数组
  _nodesTree: TangoViewNodeDataType[];
  /**
   * 通过导入组件名查找组件来自的包
   */
  importMap: Dict<{ package: string; isDefault?: boolean }>;

  /**
   * 视图中依赖的 tango 变量，仅 stores 和 services
   */
  variables: string[];

  /**
   * 节点列表
   */
  private _nodes: Map<string, TangoNode>;
  /**
   * 导入的模块
   */
  private _importedModules: Dict<ImportDeclarationPayloadType | ImportDeclarationPayloadType[]>;
  /**
   * 类属性
   * @deprecated
   */
  private _classProperties: Dict<ClassPropertyNodeType>;
  /**
   * 状态属性
   */
  private _stateProperties: string[];
  /**
   * 状态代码
   */
  private _stateCode: string;
  /**
   * ID 生成器
   */
  private _idGenerator: IdGenerator;

  get classProperties() {
    return this._classProperties;
  }

  get stateProperties() {
    return this._stateProperties;
  }

  get nodes() {
    return this._nodes;
  }

  get nodesTree() {
    return toJS(this._nodesTree);
  }

  get stateCode() {
    return this._stateCode;
  }

  get tree() {
    return this.ast;
  }

  constructor(workspace: IWorkspace, props: ModulePropsType) {
    super(workspace, props, false);
    this._nodes = new Map();
    this._idGenerator = new IdGenerator({ prefix: props.filename });
    this.update(props.code, true, false);
    makeObservable(this, {
      _nodesTree: observable,

      _code: observable,
      _cleanCode: observable,

      code: computed,
      cleanCode: computed,

      update: action,
    });
  }

  _syncByAst() {
    // 空方法，逻辑合并到 this._analysisAst
  }

  _analysisAst() {
    const {
      ast: newAst,
      cleanAst,
      nodes,
      stateCode,
      stateProperties,
      classProperties,
      importedModules,
      variables,
    } = traverseViewFile(this.ast, this._idGenerator);
    this.ast = newAst;

    this._code = ast2code(newAst);
    this._cleanCode = ast2code(cleanAst);

    this._stateCode = stateCode;

    this._stateProperties = stateProperties;
    this._classProperties = classProperties;
    this._importedModules = importedModules;
    this.importMap = this.buildImportMap(importedModules);
    this.variables = variables;

    this._nodes.clear();

    nodes.forEach((cur) => {
      const node = new TangoNode({
        ...cur,
        file: this,
      });
      this._nodes.set(cur.id, node);
    });

    this._nodesTree = nodeListToTreeData(nodes);
  }

  /**
   * 基于组件的 prototype 信息更新导入信息
   * @param prototype
   * @param shouldUpdateCode
   */
  updateImportSpecifiersByPrototype(sourcePrototype: string | ComponentPrototypeType) {
    const prototype = this.workspace.getPrototype(sourcePrototype);
    if (prototype) {
      const importDeclaration = getImportDeclarationPayloadByPrototype(prototype, this.filename);
      this.updateImportSpecifiers(importDeclaration);
    }
    return this;
  }

  /**
   * 更新导入的变量（新版）
   */
  updateImportSpecifiers(importDeclaration: ImportDeclarationPayloadType) {
    const mods = this._importedModules[importDeclaration.sourcePath];
    let ast;
    // 如果模块已存在，需要去重
    if (mods) {
      const targetMod = Array.isArray(mods) ? mods[0] : mods;
      const specifiers = Array.isArray(mods)
        ? mods.reduce((prev, cur) => prev.concat(cur.specifiers || []), [])
        : mods.specifiers;

      // 去掉已存在的导入声明
      const newSpecifiers = importDeclaration.specifiers.filter(
        (name) => !specifiers.includes(name),
      );

      ast = updateImportDeclaration(this.ast, {
        ...importDeclaration,
        specifiers: newSpecifiers.concat(targetMod.specifiers),
      });
    } else {
      ast = addImportDeclaration(this.ast, importDeclaration);
    }
    this.ast = ast;
    return this;
  }

  /**
   * 清除无效的导入声明
   */
  removeUnusedImportSpecifiers() {
    this.ast = removeUnusedImportSpecifiers(this.ast);
    return this;
  }

  getNode(nodeId: string) {
    return this._nodes.get(nodeId);
  }

  /**
   * 删除节点
   * @param nodeId
   */
  removeNode(nodeId: string) {
    this.ast = removeJSXElement(this.ast, nodeId);
    return this;
  }

  /**
   * 更新节点的属性
   * @deprecated 使用 updateNodeAttributes 代替
   */
  updateNodeAttribute(
    nodeId: string,
    attrName: string,
    attrValue?: any,
    relatedImports?: string[],
  ) {
    return this.updateNodeAttributes(nodeId, { [attrName]: attrValue }, relatedImports);
  }

  updateNodeAttributes(nodeId: string, config: Record<string, any>, relatedImports?: string[]) {
    if (relatedImports && relatedImports.length) {
      // 导入依赖的组件
      relatedImports.forEach((name: string) => {
        const proto = this.workspace.getPrototype(name);
        this.updateImportSpecifiersByPrototype(proto);
      });
    }
    this.ast = updateJSXAttributes(this.ast, nodeId, config);
    return this;
  }

  /**
   * 插入子节点的最后面
   * @param targetNodeId
   * @param newNode
   * @param sourceName
   * @returns
   */
  insertChild(
    targetNodeId: string,
    newNode: t.JSXElement,
    position: InsertChildPositionType = 'last',
    sourceName: string | ComponentPrototypeType,
  ) {
    this.ast = appendChildToJSXElement(this.ast, targetNodeId, newNode, position);
    if (sourceName) {
      this.updateImportSpecifiersByPrototype(sourceName);
    }
    return this;
  }

  insertAfter(
    targetNodeId: string,
    newNode: t.JSXElement,
    sourceName?: string | ComponentPrototypeType,
  ) {
    this.ast = insertSiblingAfterJSXElement(this.ast, targetNodeId, newNode);
    if (sourceName) {
      this.updateImportSpecifiersByPrototype(sourceName);
    }
    return this;
  }

  insertBefore(
    targetNodeId: string,
    newNode: t.JSXElement,
    sourceName?: string | ComponentPrototypeType,
  ) {
    this.ast = insertSiblingBeforeJSXElement(this.ast, targetNodeId, newNode);
    if (sourceName) {
      this.updateImportSpecifiersByPrototype(sourceName);
    }
    return this;
  }

  /**
   * 替换目标节点为新节点
   * @param targetNodeId
   * @param newNode
   * @param sourcePrototype
   */
  replaceNode(
    targetNodeId: string,
    newNode: t.JSXElement,
    sourceName?: string | ComponentPrototypeType,
  ) {
    this.ast = replaceJSXElement(this.ast, targetNodeId, newNode);
    if (sourceName) {
      this.updateImportSpecifiersByPrototype(sourceName);
    }
    return this;
  }

  /**
   * 替换 jsx 跟结点的子元素
   */
  replaceViewChildren(
    childrenNodes: t.JSXElement[],
    importDeclarations?: ImportDeclarationPayloadType[],
  ) {
    if (childrenNodes.length) {
      this.ast = replaceRootJSXElementChildren(this.ast, childrenNodes);
    }

    if (importDeclarations?.length) {
      importDeclarations.forEach((item) => {
        this.updateImportSpecifiers(item);
      });
    }

    return this;
  }

  private buildImportMap(
    importedModules: Dict<ImportDeclarationPayloadType | ImportDeclarationPayloadType[]>,
  ) {
    const map = {};
    Object.keys(importedModules).forEach((modName) => {
      const mod = importedModules[modName];
      (Array.isArray(mod) ? mod : [mod]).forEach((item) => {
        if (item.defaultSpecifier) {
          map[item.defaultSpecifier] = {
            package: modName,
            isDefault: true,
          };
        }
        if (item.specifiers.length) {
          item.specifiers.forEach((spe) => {
            map[spe] = { package: modName };
          });
        }
      });
    });
    return map;
  }
}

/**
 * 将节点列表转换为 tree data 嵌套数组
 * @param list
 */
export function nodeListToTreeData(list: TangoViewNodeDataType[]) {
  const map: Record<string, TangoViewNodeDataType> = {};

  list.forEach((item) => {
    // 如果不存在，则初始化
    if (!map[item.id]) {
      map[item.id] = {
        ...item,
        children: [],
      };
    }

    // 是否找到父节点，找到则塞进去
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    }
  });

  // 保留根节点
  const ret = Object.values(map).filter((item) => !item.parentId);
  return ret;
}

/**
 * 数据服务模块
 */
export class TangoServiceModule extends TangoModule {
  /**
   * 模块名
   */
  name: string;

  _serviceFunctions: Dict;

  _baseConfig: Dict;

  get serviceFunctions() {
    return toJS(this._serviceFunctions);
  }

  get baseConfig() {
    return toJS(this._baseConfig);
  }

  constructor(workspace: IWorkspace, props: ModulePropsType) {
    super(workspace, props, false);
    this.name = getModuleNameByFilename(props.filename);
    this.update(props.code, true, false);

    makeObservable(this, {
      _serviceFunctions: observable,
      _baseConfig: observable,
      _code: observable,
      _cleanCode: observable,
      serviceFunctions: computed,
      baseConfig: computed,
      cleanCode: computed,
      code: computed,
      update: action,
    });
  }

  _analysisAst() {
    const { services, baseConfig } = traverseServiceFile(this.ast);
    this._serviceFunctions = services;
    this._baseConfig = baseConfig;
  }

  addServiceFunction(payload: ServiceFunctionPayloadType) {
    const { name, ...rest } = payload;
    this.ast = updateServiceConfigToServiceFile(this.ast, { [name]: clone(rest, false) });
    return this;
  }

  addServiceFunctions(payloads: ServiceFunctionPayloadType[]) {
    const config = payloads.reduce((acc, cur) => {
      const { name, ...rest } = cur;
      acc[name] = clone(rest, false);
      return acc;
    }, {});
    this.ast = updateServiceConfigToServiceFile(this.ast, config);
    return this;
  }

  updateServiceFunction(payload: ServiceFunctionPayloadType) {
    const { name, ...rest } = payload;
    this.ast = updateServiceConfigToServiceFile(this.ast, { [name]: clone(rest, false) });
    return this;
  }

  deleteServiceFunction(serviceFunctionName: string) {
    try {
      this.ast = deleteServiceConfigFromServiceFile(this.ast, serviceFunctionName);
    } catch (e) {
      logger.error(e);
    }
    return this;
  }

  /**
   * 更新服务的基础配置
   */
  updateBaseConfig(optionName: string, optionValue: any) {
    this.ast = updateBaseConfigToServiceFile(this.ast, optionName, optionValue);
    return this;
  }
}

/**
 * 状态模型模块
 */
export class TangoStoreModule extends TangoModule {
  /**
   * 模块名
   */
  name: string;

  namespace: string;

  states: StorePropertyType[];

  actions: StorePropertyType[];

  constructor(workspace: IWorkspace, props: ModulePropsType) {
    super(workspace, props, false);
    this.name = getModuleNameByFilename(props.filename);
    this.update(props.code, true, false);

    makeObservable(this, {
      states: observable,
      actions: observable,
      _code: observable,
      _cleanCode: observable,
      cleanCode: computed,
      code: computed,
      update: action,
    });
  }

  /**
   * 添加状态属性
   * @param stateName
   * @param initValue
   */
  addState(stateName: string, initValue: string) {
    this.ast = addStoreState(this.ast, stateName, initValue);
    return this;
  }

  /**
   * 移除状态
   */
  removeState(stateName: string) {
    this.ast = removeStoreState(this.ast, stateName);
    return this;
  }

  /**
   * 更新状态代码
   * @param stateName 状态名
   * @param code 代码
   */
  updateState(stateName: string, code: string) {
    this.ast = updateStoreState(this.ast, stateName, code);
    return this;
  }

  _analysisAst() {
    const { namespace, states, actions } = traverseStoreFile(this.ast);
    this.namespace = namespace || this.name;
    this.states = states;
    this.actions = actions;
  }
}
