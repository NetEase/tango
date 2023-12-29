/**
 * 访问，遍历，修改 ast tree
 */

import * as t from '@babel/types';
import traverse, { TraverseOptions } from '@babel/traverse';
import {
  isFunction,
  SLOT,
  logger,
  StringOrNumber,
  Dict,
  parseDndId,
  upperCamelCase,
} from '@music163/tango-helpers';
import { keyNode2value, jsxAttributeValueNode2value, node2value, node2code } from './generate';
import {
  value2jsxAttributeValueNode,
  value2jsxChildrenValueNode,
  value2node,
  makeJSXAttribute,
  code2expression,
  object2node,
} from './parse';
import { getFullPath, isValidComponentName } from '../string';
import { isDefineService, isDefineStore, isTangoVariable } from '../assert';
import type {
  IRouteData,
  IStorePropertyData,
  ITangoViewNodeData,
  IImportDeclarationPayload,
  InsertChildPositionType,
  IImportSpecifierData,
  IExportSpecifierData,
} from '../../types';
import { IdGenerator } from '../id-generator';

/**
 * 将 Node 节点构造为一棵树，并执行树的遍历操作，此操作会修改原始的节点
 * @param node
 * @param options
 * @returns 返回完整的 File AST
 */
export function traverseExpressionNode(node: t.Expression, options: TraverseOptions) {
  const file = t.file(t.program([t.blockStatement([t.expressionStatement(node)])]));
  traverse(file, options);
  return file;
}

type JSXElementChildrenType = Array<
  t.JSXElement | t.JSXText | t.JSXFragment | t.JSXExpressionContainer | t.JSXSpreadChild
>;

/**
 * 遍历 jsxElement 的 attributes 集合
 * @param node
 * @param visitCallback
 */
function visitJSXElementAttributes(
  node: t.JSXElement,
  visitCallback: (
    name: StringOrNumber,
    value: any,
    node: t.JSXAttribute | JSXElementChildrenType,
  ) => void,
) {
  node.openingElement.attributes.forEach((attrNode) => {
    if (isFunction(visitCallback) && attrNode.type === 'JSXAttribute') {
      const name = keyNode2value(attrNode.name);
      const value = jsxAttributeValueNode2value(attrNode.value);
      visitCallback(name, value, attrNode);
    }
  });
  // TIP: 如果 children 节点为简单数据类型，则也作为属性值
  if (node.children.length === 1) {
    const onlyChild = node.children[0];
    let nodeValue;
    if (t.isJSXText(onlyChild)) {
      nodeValue = onlyChild.value?.trim();
    } else if (t.isJSXExpressionContainer(onlyChild)) {
      nodeValue = jsxAttributeValueNode2value(onlyChild);
    }
    if (nodeValue) {
      visitCallback('children', nodeValue, node.children);
    }
  }
}

/**
 * 删除 jsxElement 的目标属性
 * @param node
 * @param attrName
 */
function removeJSXElementAttributeByName(node: t.JSXElement, attrName: string) {
  node.openingElement.attributes = node.openingElement.attributes.filter((attrNode) => {
    if (t.isJSXAttribute(attrNode)) {
      const name = keyNode2value(attrNode.name);
      return name !== attrName;
    }
    return true;
  });
}

/**
 * 获取 jsx 节点的属性集
 * @param node
 * @returns
 */
export function getJSXElementAttributes(node: t.JSXElement) {
  const ret: Record<string, any> = {};
  visitJSXElementAttributes(node, (name, value) => {
    ret[name] = value;
  });
  return ret;
}

/**
 * 获取 jsx 结点的子元素名字
 * @param node
 * @returns
 */
export function getJSXElementChildrenNames(node: t.JSXElement) {
  const names = new Set<string>();
  traverseExpressionNode(node, {
    JSXElement(path) {
      const name = getJSXElementName(path.node);

      // invalid name
      if (!name) {
        return;
      }

      // html tags, e.g. div, span...
      if (name.toLowerCase() === name) {
        return;
      }

      const parts = name.split('.');

      // 嵌套类型 Button.Group，只取父级
      if (parts.length) {
        names.add(parts[0]);
      }
    },
  });
  return Array.from(names);
}

/**
 * 匹配名字叫 targetName 的组件
 * @param ast
 * @param targetName
 * @param callback
 */
function visitJSXElementByName(
  ast: t.File | t.JSXElement,
  targetName: string,
  callback: (node: t.JSXElement) => void,
) {
  const visitors: TraverseOptions = {
    JSXElement(path) {
      if (getJSXElementName(path.node) === targetName) {
        callback(path.node);
      }
    },
  };
  switch (ast.type) {
    case 'File':
      traverse(ast, visitors);
      break;
    case 'JSXElement':
      traverseExpressionNode(ast, visitors);
  }
}

/**
 * 查询所有XFormItem的字段名
 * @param ast 当前文件AST
 * @returns 所有 XFormItem 的字段名
 */
export function queryXFormItemFields(ast: t.File | t.JSXElement) {
  const fields: string[] = [];
  visitJSXElementByName(ast, 'XFormItem', (node) => {
    const attrs = getJSXElementAttributes(node);
    if (attrs.name && !fields.includes(attrs.name)) {
      fields.push(attrs.name);
    }
  });
  return fields;
}

/**
 * 根据 dnd id 判断是否是目标的 JSXElement
 * @param node
 * @param id
 */
export function isJSXElementById(node: t.JSXElement, jsxElementNodeId: string) {
  let isTargetJSXElement = false;
  visitJSXElementAttributes(node, (name, value) => {
    if (name === SLOT.dnd && value === jsxElementNodeId) {
      isTargetJSXElement = true;
    }
  });
  return isTargetJSXElement;
}

/**
 * 在目标 jsx 元素中添加子元素
 * @param ast
 * @param targetJSXElementNodeId
 * @param newNode
 * @returns
 */
export function appendChildToJSXElement(
  ast: t.File,
  targetJSXElementNodeId: string,
  newNode: t.JSXElement,
  position: InsertChildPositionType,
) {
  traverse(ast, {
    JSXElement(path) {
      if (isJSXElementById(path.node, targetJSXElementNodeId)) {
        // 强制变为非闭合标签 & 避免children添加失败
        if (path.node.openingElement.selfClosing) {
          path.node.openingElement.selfClosing = false;
          path.node.closingElement = t.jSXClosingElement(path.node.openingElement.name);
        }
        if (position === 'last') {
          path.node.children.push(newNode);
        } else {
          path.node.children.unshift(newNode);
        }
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 在目标 jsx 元素后添加兄弟节点
 * @param ast
 * @param targetJSXElementNodeId
 * @param newNode
 */
export function insertSiblingAfterJSXElement(
  ast: t.File,
  targetJSXElementNodeId: string,
  newNode: t.JSXElement,
) {
  traverse(ast, {
    JSXElement(path) {
      if (isJSXElementById(path.node, targetJSXElementNodeId)) {
        if (path.parentPath.isJSXElement()) {
          path.insertAfter(newNode);
        } else if (path.parentPath.isJSXExpressionContainer()) {
          const fragmentNode = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [
            t.cloneDeepWithoutLoc(path.node),
            newNode,
          ]);
          path.replaceWith(fragmentNode);
        }
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 在目标 jsx 元素前添加兄弟节点
 * @param ast
 * @param targetJSXElementNodeId
 * @param newNode
 * @returns
 */
export function insertSiblingBeforeJSXElement(
  ast: t.File,
  targetJSXElementNodeId: string,
  newNode: t.JSXElement,
) {
  traverse(ast, {
    JSXElement(path) {
      if (isJSXElementById(path.node, targetJSXElementNodeId)) {
        path.insertBefore(newNode);
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 替换目标 jsx 元素为新的元素
 * @param ast
 * @param targetJSXElementNodeId
 * @param newNode
 * @returns
 */
export function replaceJSXElement(
  ast: t.File,
  targetJSXElementNodeId: string,
  newNode: t.JSXElement,
) {
  traverse(ast, {
    JSXElement(path) {
      if (isJSXElementById(path.node, targetJSXElementNodeId)) {
        path.replaceWith(newNode);
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 删除目标 jsx 元素
 * @param ast
 * @param targetJSXElementNodeId
 */
export function removeJSXElement(ast: t.File, targetJSXElementNodeId: string) {
  traverse(ast, {
    JSXElement(path) {
      if (isJSXElementById(path.node, targetJSXElementNodeId)) {
        const { parentPath } = path;
        const ancestorPath = path.parentPath.parentPath;
        if (t.isJSXElement(parentPath.node)) {
          path.remove();
        } else if (t.isJSXAttribute(ancestorPath.node)) {
          // 如果祖先节点在 jsxAttribute 上，则删除该属性
          ancestorPath.remove();
        } else {
          logger.error('removeJSXElement failed', path.node);
        }
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 替换跟结点的子元素
 * @example 例如替换 `return (<Box {...props}>empty block</Box>)` 的子元素
 * @param ast
 * @param nodes
 */
export function replaceRootJSXElementChildren(ast: t.File, nodes: t.JSXElement[]) {
  traverse(ast, {
    JSXElement(path) {
      path.node.children = nodes;
      path.stop();
    },
  });
  return ast;
}

/**
 * 新增 JSXElement 的属性节点
 * @param node
 * @param name
 * @param value
 */
function addJSXElementAttribute(node: t.JSXElement, name: string, value: any) {
  if (name === 'children' && node.children) {
    // jsx children 的情况
    node.children = value2jsxChildrenValueNode(value);
  } else {
    // basic attributes
    const jsxAttributeNode = t.jsxAttribute(
      t.jsxIdentifier(name),
      value2jsxAttributeValueNode(value),
    );
    node.openingElement.attributes.push(jsxAttributeNode);
  }
  return node;
}

export function updateJSXElementAttribute(node: t.JSXElement, attrName: string, attrValue: any) {
  const isUndefinedValue = attrValue === undefined;
  let isExist = false;

  if (isUndefinedValue) {
    // 清空该属性
    removeJSXElementAttributeByName(node, attrName);
  } else {
    // 更新该属性
    visitJSXElementAttributes(node, (name, prevValue, jsxAttributeNode) => {
      if (name === attrName) {
        isExist = true;
        // @ts-ignore
        if (t.isJSXAttribute(jsxAttributeNode)) {
          jsxAttributeNode.value = value2jsxAttributeValueNode(attrValue);
        } else if (name === 'children') {
          node.children = value2jsxChildrenValueNode(attrValue);
        }
      }
    });
  }

  if (!isExist && !isUndefinedValue) {
    // 添加该属性
    addJSXElementAttribute(node, attrName, attrValue);
  }

  return node;
}

export function updateJSXAttributes(ast: t.File, nodeId: string, config: Record<string, any>) {
  traverse(ast, {
    JSXElement(path) {
      if (isJSXElementById(path.node, nodeId)) {
        Object.keys(config).forEach((attrName) => {
          updateJSXElementAttribute(path.node, attrName, config[attrName]);
        });
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 从 ast 中找到最后一次 import 的位置的序号
 */
function getLastImportDeclarationIndex(node: t.Program) {
  let lastImportIndex = 0;
  node.body.forEach((item, index) => {
    if (item.type === 'ImportDeclaration') {
      lastImportIndex = index + 1;
    }
  });
  return lastImportIndex;
}

/**
 * 从 ast 中找到最后一次 export 的位置的序号
 */
function getLastExportDeclarationIndex(node: t.Program) {
  let lastExportIndex = 0;
  node.body.forEach((item, index) => {
    if (item.type === 'ExportNamedDeclaration') {
      lastExportIndex = index + 1;
    }
  });
  return lastExportIndex;
}

/**
 * 生成新的 ImportDeclaration
 * @deprecated 使用 makeImportDeclaration2 代替
 * @param importedModule
 * @param importedSourcePath
 * @returns
 */
export function makeImportDeclarationLegacy(importedModule: IImportDeclarationPayload) {
  const specifierNodes =
    importedModule.specifiers?.map((localName) =>
      t.importSpecifier(t.identifier(localName), t.identifier(localName)),
    ) || [];

  let defaultSpecifierNode: t.ImportDefaultSpecifier;
  if (importedModule.defaultSpecifier) {
    defaultSpecifierNode = t.importDefaultSpecifier(t.identifier(importedModule.defaultSpecifier));
  }

  const newSpecifierNodes = [defaultSpecifierNode, ...specifierNodes].filter((spec) => !!spec);
  return t.importDeclaration(newSpecifierNodes, t.stringLiteral(importedModule.sourcePath));
}

function specifierData2node(data: IImportSpecifierData) {
  switch (data.type) {
    case 'ImportDefaultSpecifier':
      return t.importDefaultSpecifier(t.identifier(data.localName));
    case 'ImportSpecifier':
      return t.importSpecifier(
        t.identifier(data.importedName || data.localName),
        t.identifier(data.localName),
      );
    case 'ImportNamespaceSpecifier':
      return t.importNamespaceSpecifier(t.identifier(data.localName));
    default:
      return;
  }
}

function specifierDataList2nodes(specifiers: IImportSpecifierData[]) {
  return specifiers.map((item) => specifierData2node(item)).filter((item) => !!item);
}

export function makeImportDeclaration(source: string, specifiers: IImportSpecifierData[]) {
  const specifierNodes = specifierDataList2nodes(specifiers);
  return t.importDeclaration(specifierNodes, t.stringLiteral(source));
}

/**
 * @deprecated 使用 parseImportDeclaration 代替
 * @param node
 * @returns
 */
function getImportDeclarationData(node: t.ImportDeclaration): IImportDeclarationPayload {
  const sourcePath = node2value(node.source);
  let defaultSpecifier;
  const specifiers: string[] = [];
  node.specifiers.forEach((specifier) => {
    if (specifier.type === 'ImportDefaultSpecifier') {
      defaultSpecifier = keyNode2value(specifier.local);
    } else if (specifier.type === 'ImportSpecifier') {
      specifiers.push(keyNode2value(specifier.local) as string);
    }
  });
  return {
    defaultSpecifier,
    specifiers,
    sourcePath,
  };
}

/**
 * 添加新的导入语句
 * @deprecated 使用 addImportDeclaration2 代替
 * @param ast
 * @param importedModule
 * @param importedSourcePath
 * @returns
 */
export function addImportDeclarationLegacy(ast: t.File, importedModule: IImportDeclarationPayload) {
  traverse(ast, {
    Program(path) {
      const lastIndex = getLastImportDeclarationIndex(path.node);
      const newImportDeclaration = makeImportDeclarationLegacy(importedModule);
      path.node.body.splice(lastIndex, 0, newImportDeclaration);
      path.stop();
    },
  });
  return ast;
}

export function addImportDeclaration(
  ast: t.File,
  source: string,
  specifiers: IImportSpecifierData[],
) {
  traverse(ast, {
    Program(path) {
      const lastIndex = getLastImportDeclarationIndex(path.node);
      const newImportDeclaration = makeImportDeclaration(source, specifiers);
      path.node.body.splice(lastIndex, 0, newImportDeclaration);
      path.stop();
    },
  });
  return ast;
}

/**
 * 更新已有的导入语句
 * @deprecated 使用 updateImportDeclaration2 代替
 * @param ast
 * @param importedModule
 * @param importedSourcePath
 * @returns
 */
export function updateImportDeclarationLegacy(
  ast: t.File,
  importedModule: IImportDeclarationPayload,
) {
  traverse(ast, {
    ImportDeclaration(path) {
      const currentSourcePath = node2value(path.node.source);
      if (currentSourcePath === importedModule.sourcePath) {
        const newImportDeclaration = makeImportDeclarationLegacy(importedModule);
        path.replaceWith(newImportDeclaration);
        path.stop(); // 只修改匹配到的第一条
      }
    },
  });
  return ast;
}

export function updateImportDeclaration(
  ast: t.File,
  source: string,
  specifiers: IImportSpecifierData[],
) {
  traverse(ast, {
    ImportDeclaration(path) {
      const currentSourcePath = node2value(path.node.source);
      if (currentSourcePath === source) {
        const newImportDeclaration = makeImportDeclaration(source, specifiers);
        path.replaceWith(newImportDeclaration);
        path.stop(); // 只修改匹配到的第一条
      }
    },
  });
  return ast;
}

/**
 * 再已有的导入语句中添加新的导入符号
 * @param ast
 * @param source
 * @param newSpecifiers
 * @returns
 */
export function insertImportSpecifiers(
  ast: t.File,
  source: string,
  newSpecifiers: IImportSpecifierData[],
) {
  traverse(ast, {
    ImportDeclaration(path) {
      const currentSourcePath = node2value(path.node.source);
      if (currentSourcePath === source) {
        const nodes = specifierDataList2nodes(newSpecifiers);
        path.node.specifiers.push(...nodes);
        // 只在匹配到的第一个导入声明语句添加即可，不再重复执行
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 新增类属性
 * @param ast
 * @param classPropertyNode
 * @returns
 */
export function addClassProperty(ast: t.File, classPropertyNode: t.ClassProperty) {
  traverse(ast, {
    ClassBody(path) {
      path.node.body.push(classPropertyNode);
      path.stop();
    },
  });
  return ast;
}

/**
 * 更新类属性
 * @param ast
 * @param targetPropertyName
 * @param propertyValueNode
 * @returns
 */
export function updateClassProperty(
  ast: t.File,
  targetPropertyName: string,
  propertyValueNode: t.Expression,
) {
  traverse(ast, {
    ClassProperty(path) {
      const name = keyNode2value(path.node.key);
      if (name === targetPropertyName) {
        path.node.value = propertyValueNode;
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 在 routes.js 中添加新的路由规则
 * @param ast
 * @param pageName
 * @returns
 */
export function addRouteToRouteFile(ast: t.File, routePath: string, importFilePath: string) {
  if (/.jsx?$/.test(importFilePath)) {
    importFilePath = importFilePath.split('.')[0];
  }
  const component = upperCamelCase(routePath.split('/').join('-'));
  traverse(ast, {
    Program(path) {
      const lastImportIndex = getLastImportDeclarationIndex(path.node);
      path.node.body.splice(
        lastImportIndex,
        0,
        t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier(component))],
          t.stringLiteral(importFilePath.replace('/src', '.')),
        ),
      );
    },
    ArrayExpression(path) {
      const newNode = t.objectExpression([
        t.objectProperty(t.identifier('path'), t.stringLiteral(routePath)),
        t.objectProperty(t.identifier('component'), t.identifier(component)),
        t.objectProperty(t.identifier('exact'), t.booleanLiteral(true)),
      ]);
      path.node.elements.push(newNode);
    },
  });
  return ast;
}

/**
 * 更新页面路由
 * @param ast
 * @param oldRoutePath
 * @param newRoutePath
 * @returns
 */
export function updateRouteToRouteFile(ast: t.File, oldRoutePath: string, newRoutePath: string) {
  traverse(ast, {
    ObjectExpression(path) {
      path.node.properties.forEach((prop) => {
        if (
          t.isObjectProperty(prop) &&
          node2value(prop.key, false) === 'path' &&
          node2value(prop.value, false) === oldRoutePath
        ) {
          prop.value = t.stringLiteral(newRoutePath);
        }
      });
    },
  });
  return ast;
}

export function removeRouteFromRouteFile(ast: t.File, routePath: string, importPath: string) {
  traverse(ast, {
    ArrayExpression(path) {
      path.node.elements = path.node.elements.filter((element) => {
        if (element.type === 'ObjectExpression') {
          const properties = node2value(element);
          if (properties.path === routePath) {
            return false;
          }
        }
        return true;
      });
    },
    ImportDeclaration(path) {
      const sourceValue = node2value(path.node.source);
      if (sourceValue === importPath) {
        path.remove();
      }
    },
  });
  return ast;
}

export function traverseRouteFile(ast: t.File) {
  const routes: IRouteData[] = [];
  const importMap: Dict<string> = {};

  traverse(ast, {
    ImportDeclaration(path) {
      const { defaultSpecifier, sourcePath } = getImportDeclarationData(path.node);
      if (defaultSpecifier) {
        importMap[defaultSpecifier] = sourcePath;
      }
    },
    ObjectExpression(path) {
      const { node } = path;
      const route = node2value(node, false);
      routes.push(route);
    },
  });

  routes.forEach((item) => {
    if (item.component && importMap[item.component]) {
      item.importPath = importMap[item.component];
    }
  });

  return routes;
}

/**
 * 在 stores/index.js 中添加新的store
 * @param ast
 * @param storeName
 * @returns
 */
export function addStoreToEntryFile(ast: t.File, storeName: string) {
  const filepath = `./${storeName}`;
  const component = storeName;
  traverse(ast, {
    Program(path) {
      const lastExportIndex = getLastExportDeclarationIndex(path.node);
      path.node.body.splice(
        lastExportIndex,
        0,
        t.exportNamedDeclaration(
          null,
          [t.exportSpecifier(t.identifier('default'), t.identifier(component))],
          t.stringLiteral(filepath),
        ),
      );
    },
  });
  return ast;
}

/**
 * 在 stores/index.js 中移除一行导出语句
 * @example export { default as app } from "./app";
 * @param ast
 * @param storeName
 * @returns
 */
export function removeStoreToEntryFile(ast: t.File, storeName: string) {
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const name = keyNode2value(path.node.specifiers?.[0].exported);
      if (name === storeName) {
        path.remove();
        path.stop();
      }
    },
  });
  return ast;
}

export function traverseStoreEntryFile(ast: t.File) {
  const stores: string[] = [];

  traverse(ast, {
    ExportSpecifier(path) {
      const name = keyNode2value(path.node.exported) as string;
      stores.push(name);
    },
  });

  return stores;
}

export function addStoreState(ast: t.File, stateName: string, initValue: string) {
  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      const calleeName = keyNode2value(node.callee) as string;
      if (
        isDefineStore(calleeName) &&
        node.arguments.length &&
        t.isObjectExpression(node.arguments[0])
      ) {
        node.arguments[0].properties.push(
          t.objectProperty(t.identifier(stateName), code2expression(initValue)),
        );
        path.stop();
      }
    },
  });
  return ast;
}

export function removeStoreState(ast: t.File, stateName: string) {
  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      const calleeName = keyNode2value(node.callee) as string;
      if (
        isDefineStore(calleeName) &&
        node.arguments.length &&
        t.isObjectExpression(node.arguments[0])
      ) {
        let { properties } = node.arguments[0];
        properties = properties.filter((prop) => {
          if (prop.type === 'SpreadElement') {
            return true;
          }
          const propName = keyNode2value(prop.key);
          return propName !== stateName;
        });
        node.arguments[0].properties = properties;
      }
    },
  });
  return ast;
}

export function updateStoreState(ast: t.File, stateName: string, code: string) {
  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      const calleeName = keyNode2value(node.callee) as string;
      if (
        isDefineStore(calleeName) &&
        node.arguments.length &&
        t.isObjectExpression(node.arguments[0])
      ) {
        const { properties } = node.arguments[0];
        for (const prop of properties) {
          if (prop.type === 'SpreadElement') {
            continue;
          }

          const propName = keyNode2value(prop.key);
          if (propName === stateName) {
            // TIP: 仅支持对象属性，方法必须需要写为箭头函数
            if (prop.type === 'ObjectProperty') {
              prop.value = code2expression(code);
              break;
            }
          }
        }
      }
    },
  });
  return ast;
}

export function traverseStoreFile(ast: t.File) {
  let namespace: string;
  const actions: IStorePropertyData[] = [];
  const states: IStorePropertyData[] = [];

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      const calleeName = keyNode2value(node.callee) as string;
      if (
        isDefineStore(calleeName) &&
        node.arguments.length &&
        t.isObjectExpression(node.arguments[0])
      ) {
        node.arguments[0].properties.forEach((item) => {
          switch (item.type) {
            case 'ObjectMethod': {
              actions.push({
                name: keyNode2value(item.key) as string,
                type: 'method',
              });
              break;
            }
            case 'ObjectProperty': {
              const name = keyNode2value(item.key) as string;
              if (t.isArrowFunctionExpression(item.value)) {
                actions.push({
                  name,
                  type: 'method',
                  code: node2code(item.value),
                });
              } else if (t.isFunctionExpression(item.value)) {
                actions.push({
                  name,
                  type: 'method',
                  code: node2code(item.value),
                });
              } else {
                states.push({
                  name,
                  type: 'property',
                  code: node2code(item.value),
                });
              }
              break;
            }
            default:
          }
        });
        if (node.arguments[1]) {
          namespace = node2value(node.arguments[1], false);
        }
        path.stop();
      }
    },
  });
  return {
    namespace,
    states,
    actions,
  };
}

export function deleteServiceConfigFromServiceFile(ast: t.File, serviceFunctionName: string) {
  traverse(ast, {
    CallExpression(path) {
      const calleeName = keyNode2value(path.node.callee) as string;
      if (isDefineService(calleeName)) {
        if (path.node.arguments.length) {
          const configNode = path.node.arguments[0];
          if (t.isObjectExpression(configNode)) {
            const index = configNode.properties.findIndex((property) => {
              if (t.isObjectProperty(property)) {
                return keyNode2value(property.key) === serviceFunctionName;
              }
              return false;
            });
            configNode.properties.splice(index, 1);
          }
        }
        path.stop();
      }
    },
  });
  return ast;
}

/**
 * 将服务函数的配置参数转为 ast 节点
 * @param payload
 * @returns
 */
export function serviceConfig2Node(payload: object) {
  return object2node(payload, (value, key) => {
    if (key === 'formatter' && value) {
      return code2expression(value);
    }
    return value2node(value);
  });
}

export function updateServiceConfigToServiceFile(ast: t.File, config: object) {
  traverse(ast, {
    CallExpression(path) {
      const calleeName = keyNode2value(path.node.callee) as string;
      if (isDefineService(calleeName) && path.node.arguments.length) {
        const configNode = path.node.arguments[0];

        if (t.isObjectExpression(configNode)) {
          const newPropertiesNodeMap = Object.keys(config).reduce((properties, key) => {
            const serviceConfig = config[key];
            const property = t.objectProperty(t.identifier(key), serviceConfig2Node(serviceConfig));
            properties[key] = property;
            return properties;
          }, {});

          Object.keys(newPropertiesNodeMap).forEach((nodeKey) => {
            // 如果已存在, 找到原来的 propertyNode 进行替换
            const targetIndex = configNode.properties.findIndex((propNode) => {
              if (t.isObjectProperty(propNode)) {
                return keyNode2value(propNode.key) === nodeKey;
              }
              return false;
            });
            if (targetIndex !== -1) {
              configNode.properties[targetIndex] = newPropertiesNodeMap[nodeKey];
            } else {
              // 不存在，直接塞到最后边
              configNode.properties.push(newPropertiesNodeMap[nodeKey]);
            }
          });
        }
        path.stop();
      }
    },
  });
  return ast;
}

export function updateBaseConfigToServiceFile(ast: t.File, config: object) {
  traverse(ast, {
    CallExpression(path) {
      const calleeName = keyNode2value(path.node.callee) as string;
      if (isDefineService(calleeName)) {
        switch (path.node.arguments.length) {
          case 1:
            // 没有 baseConfig，直接创建新的参数即可
            path.node.arguments.push(value2node(config));
            break;
          case 2: {
            // 已存在 baseConfig，需要进行参数的合并
            const baseConfigNode = path.node.arguments[1];
            if (t.isObjectExpression(baseConfigNode)) {
              const baseConfig = node2value(baseConfigNode);
              path.node.arguments[1] = value2node({ ...baseConfig, ...config });
            }
            break;
          }
          default:
            break;
        }
        path.stop();
      }
    },
  });
  return ast;
}

export function traverseServiceFile(ast: t.File) {
  let services;
  const baseConfig: any = {
    encryptFetch: false,
  };
  const imports: Record<string, IImportSpecifierData[]> = {};
  traverse(ast, {
    ImportDeclaration(path) {
      const { source, specifiers } = parseImportDeclaration(path.node);
      imports[source] = specifiers;
    },
    CallExpression(path) {
      const calleeName = keyNode2value(path.node.callee) as string;
      if (isDefineService(calleeName)) {
        if (path.node.arguments.length) {
          services = node2value(path.node.arguments[0], false);
          if (path.node.arguments[1]) {
            const config = node2value(path.node.arguments[1]);
            baseConfig.encryptFetch = !!config.encryptFetch;
            baseConfig.namespace = config.namespace || 'index';
          }
        }
        path.stop();
      }
    },
  });
  return {
    imports,
    services,
    baseConfig,
  };
}

function getJSXElementName(node: t.JSXElement) {
  return keyNode2value(node.openingElement.name) as string;
}

/**
 * 从 JSXElement 中移除追踪属性
 * @param node
 * @returns
 */
function clearJSXElementTrackingData(node: t.JSXElement) {
  const attributes = node.openingElement.attributes.filter((attrNode) => {
    if (t.isJSXAttribute(attrNode)) {
      const attrName = keyNode2value(attrNode.name);
      if (attrName === SLOT.dnd) {
        return false;
      }
    }
    return true;
  });
  node.openingElement.attributes = attributes;
  return node;
}

/**
 * 从 JSXElement 中移除追踪属性
 * @param node
 * @returns
 */
function removeTrackingDataFromNodeAst(node: t.JSXElement) {
  traverseExpressionNode(node, {
    JSXElement(path) {
      clearJSXElementTrackingData(path.node);
    },
  });
  return node;
}

/**
 * 从视图文件的 ast 中移除追踪代码
 * @param ast
 * @warning TODO: 有 bug ，注释会重复生成，参考 https://github.com/babel/babel/issues/14549
 */
function removeTrackingDataFromViewAst(ast: t.File) {
  traverse(ast, {
    JSXElement(path) {
      clearJSXElementTrackingData(path.node);
    },
  });
  return ast;
}

/**
 * 清除文件中的无效导入代码
 * @param ast
 * @returns
 */
export function removeUnusedImportSpecifiers(ast: t.File) {
  traverse(ast, {
    ImportDeclaration(path) {
      const sourceValue = path.node.source.value;
      // e.g. import 'style.less'; import './index.css'
      if (!path.node.specifiers.length && /\.(css|less|scss|js)$/.test(sourceValue)) {
        return;
      }

      // e.g. import {} from 'pkg';
      if (!path.node.specifiers.length) {
        path.remove();
        return;
      }

      const specifiers = path.node.specifiers.filter((specifier) => {
        const name = keyNode2value(specifier.local) as string;
        const binding = path.scope.getBinding(name);
        return binding?.referenced;
      });

      if (!specifiers.length) {
        path.remove();
      } else if (specifiers.length !== path.node.specifiers.length) {
        path.node.specifiers = specifiers;
      }
    },
  });
  return ast;
}

/**
 * 克隆一个全新的 JSXElement 节点
 * @param node
 * @returns
 */
export function cloneJSXElementWithoutTrackingData(node: t.JSXElement) {
  let cloned = t.cloneNode(node, true, true);
  cloned = removeTrackingDataFromNodeAst(cloned);
  return cloned;
}

export function traverseViewFile(ast: t.File, idGenerator: IdGenerator) {
  const imports: Record<string, IImportSpecifierData[]> = {};
  const importedModules: Dict<IImportDeclarationPayload | IImportDeclarationPayload[]> = {};
  const nodes: Array<ITangoViewNodeData<t.JSXElement>> = [];
  const cloneAst = t.cloneNode(ast, true, true);
  const cleanAst = removeTrackingDataFromViewAst(cloneAst);
  const variables: string[] = []; // 使用的 tango 变量

  traverse(ast, {
    ImportDeclaration(path) {
      const { source, specifiers } = parseImportDeclaration(path.node);
      if (imports[source]) {
        // 存在重复的导入语句，合并导入符号列表
        imports[source] = imports[source].concat(specifiers);
      } else {
        imports[source] = specifiers;
      }

      // FIXME: 下面的逻辑兼容旧的逻辑，后续需要移除掉
      const declarationData = specifiers.reduce(
        (prev, cur) => {
          switch (cur.type) {
            case 'ImportDefaultSpecifier':
              prev.defaultSpecifier = cur.localName;
              break;
            case 'ImportSpecifier':
              prev.specifiers.push(cur.localName);
              break;
            case 'ImportNamespaceSpecifier':
              prev.specifiers.push(cur.localName);
              break;
            default:
              break;
          }
          return prev;
        },
        {
          defaultSpecifier: undefined,
          specifiers: [],
          sourcePath: source,
        },
      );
      const exist = importedModules[source];
      if (!exist) {
        importedModules[source] = declarationData;
      } else {
        importedModules[source] = Array.isArray(exist)
          ? exist.concat([declarationData])
          : [exist, declarationData];
      }
    },

    MemberExpression(path) {
      const variable = node2value(path.node, false);
      const parentNode = path.parentPath.node;
      if (
        !t.isMemberExpression(parentNode) &&
        isTangoVariable(variable) &&
        !variables.includes(variable)
      ) {
        variables.push(variable);
      }
    },

    OptionalMemberExpression(path) {
      const variable = node2value(path.node, false);
      if (isTangoVariable(variable) && !variables.includes(variable)) {
        variables.push(variable);
      }
    },

    JSXElement(path) {
      const attributes = getJSXElementAttributes(path.node);

      // 获取组件的追踪属性
      const trackId = attributes[SLOT.dnd];

      let { component, id } = parseDndId(trackId);
      component = component || getJSXElementName(path.node);
      idGenerator.setItem(component);

      if (!isValidComponentName(component)) {
        return;
      }

      // 如果没有 ID，生成组件的追踪 ID
      if (!trackId) {
        id = idGenerator.generateId(component);
      }

      // 在组件属性中添加追踪标记
      if (!attributes[SLOT.dnd]) {
        path.node.openingElement.attributes.unshift(makeJSXAttribute(SLOT.dnd, id));
      }

      // parentId 用于追溯上下游关系
      let parentId;
      const parentNode = path.findParent((p) => p.isJSXElement());

      if (t.isJSXElement(parentNode?.node)) {
        const parentAttributes = getJSXElementAttributes(parentNode.node);
        parentId = parentAttributes[SLOT.dnd];
      }

      nodes.push({
        id,
        parentId,
        component,
        rawNode: path.node,
      });
    },
  });

  return {
    ast,
    cleanAst,
    nodes,
    imports,
    importedModules,
    variables,
  };
}

export function traverseComponentsEntryFile(ast: t.File, baseDir?: string) {
  const exportMap: Record<string, IExportSpecifierData> = {};
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const node = path.node;
      let source = node2value(node.source);
      if (baseDir) {
        // fix relative source path
        source = getFullPath(baseDir, source);
      }
      node.specifiers.forEach((specifier) => {
        if (t.isExportSpecifier(specifier)) {
          const name = keyNode2value(specifier.exported) as string;
          if (name) {
            exportMap[name] = {
              source,
              exportedName: name,
            };
          }
        }
      });
    },
  });

  return { ast, exportMap };
}

/**
 * 解析导入语句
 */
function parseImportDeclaration(node: t.ImportDeclaration) {
  const source = node2value(node.source) as string;
  const specifiers: IImportSpecifierData[] = [];
  node.specifiers.forEach((specifierNode) => {
    const data: IImportSpecifierData = {
      localName: keyNode2value(specifierNode.local) as string,
      type: specifierNode.type,
    };
    if (specifierNode.type === 'ImportSpecifier') {
      data.importedName = keyNode2value(specifierNode.imported) as string;
    }
    specifiers.push(data);
  });

  return {
    source,
    specifiers,
  };
}

/**
 * 基本的文件解析过程
 * @param ast
 */
export function traverseFile(ast: t.File) {
  const imports: Record<string, IImportSpecifierData[]> = {};

  traverse(ast, {
    ImportDeclaration(path) {
      const { source, specifiers } = parseImportDeclaration(path.node);
      imports[source] = specifiers;
    },
  });

  return {
    imports,
  };
}
