import * as t from '@babel/types';
import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { ComponentPrototypeType, Dict } from '@music163/tango-helpers';
import {
  ast2code,
  traverseViewFile,
  removeJSXElement,
  insertSiblingAfterJSXElement,
  appendChildToJSXElement,
  addImportDeclaration,
  updateImportDeclaration,
  replaceJSXElement,
  getImportDeclarationPayloadByPrototype,
  removeUnusedImportSpecifiers,
  insertSiblingBeforeJSXElement,
  replaceRootJSXElementChildren,
  IdGenerator,
  updateJSXAttributes,
  queryXFormItemFields,
} from '../helpers';
import { TangoNode } from './node';
import {
  IFileConfig,
  ITangoViewNodeData,
  IImportDeclarationPayload,
  InsertChildPositionType,
  IImportSpecifierSourceData,
} from '../types';
import { IViewFile, IWorkspace } from './interfaces';
import { TangoModule } from './module';

/**
 * 视图模块
 */
export class TangoViewModule extends TangoModule implements IViewFile {
  // 解析为树结构的 jsxNodes 数组
  _nodesTree: ITangoViewNodeData[];
  /**
   * 通过导入组件名查找组件来自的包
   */
  importMap: Dict<IImportSpecifierSourceData>;

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
  private _importedModules: Dict<IImportDeclarationPayload | IImportDeclarationPayload[]>;

  /**
   * ID 生成器
   */
  private _idGenerator: IdGenerator;

  get nodes() {
    return this._nodes;
  }

  get nodesTree() {
    return toJS(this._nodesTree);
  }

  get tree() {
    return this.ast;
  }

  constructor(workspace: IWorkspace, props: IFileConfig) {
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
      importedModules,
      variables,
    } = traverseViewFile(this.ast, this._idGenerator);
    this.ast = newAst;

    this._code = ast2code(newAst);
    this._cleanCode = ast2code(cleanAst);

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
   * 依赖列表
   */
  listImportSources() {
    return Object.keys(this._importedModules);
  }

  /**
   * 弹窗列表
   */
  listModals() {
    const modals: Array<{ label: string; value: string }> = [];
    const activeViewNodes = this.nodes || new Map();

    Array.from(activeViewNodes.values()).forEach((node) => {
      if (['Modal', 'Drawer'].includes(node.component) && node.props.id) {
        modals.push({
          label: `${node.component}(${node.props.id})`,
          value: node.props.id,
        });
      }
    });

    return modals;
  }

  /**
   * 表单列表
   */
  listForms() {
    const forms: Record<string, string[]> = {};
    const activeViewNodes = this.nodes;
    Array.from(activeViewNodes.values()).forEach((node) => {
      if (
        ['XAction', 'XColumnAction', 'XForm', 'XStepForm', 'XSearchForm', 'XFormList'].includes(
          node.component,
        )
      ) {
        forms[node.id] = queryXFormItemFields(node.rawNode);
      }
    });
    return forms;
  }

  /**
   * 基于组件的 prototype 信息更新导入信息
   * TODO: 和 Module.addImportDeclaration 中的保持一致
   * @deprecated
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
   * TODO: 和 Module.updateImportDeclaration 中的保持一致
   * @deprecated
   */
  updateImportSpecifiers(importDeclaration: IImportDeclarationPayload) {
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
    importDeclarations?: IImportDeclarationPayload[],
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
    importedModules: Dict<IImportDeclarationPayload | IImportDeclarationPayload[]>,
  ) {
    const map: Dict<IImportSpecifierSourceData> = {};
    Object.keys(importedModules).forEach((modName) => {
      const mod = importedModules[modName];
      (Array.isArray(mod) ? mod : [mod]).forEach((item) => {
        if (item.defaultSpecifier) {
          map[item.defaultSpecifier] = {
            source: modName,
            isDefault: true,
          };
        }
        if (item.specifiers.length) {
          item.specifiers.forEach((spe) => {
            map[spe] = { source: modName };
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
function nodeListToTreeData(list: ITangoViewNodeData[]) {
  const map: Record<string, ITangoViewNodeData> = {};

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
