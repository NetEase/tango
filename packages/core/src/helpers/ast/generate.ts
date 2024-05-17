/**
 * ast to code
 */
import generator, { GeneratorOptions } from '@babel/generator';
import * as t from '@babel/types';
import { logger, wrapCode } from '@music163/tango-helpers';
import { formatCode } from '../string';

const defaultGeneratorOptions: GeneratorOptions = {
  jsescOption: { minimal: true },
  retainLines: true,
};

/**
 * 将 t.File 生成为代码
 * @param ast
 * @param options
 * @returns
 */
export function ast2code(ast: t.Node, options: GeneratorOptions = defaultGeneratorOptions) {
  let code = generator(ast, {
    ...options,
  }).code;
  code = formatCode(code);
  return code;
}

const bracketPattern = /^\(.+\)$/s;

/**
 * 是否被 () 包裹
 *
 * @example ({ foo: 'foo' }) -> true
 * @example { foo: 'foo' } -> false
 *
 * @param str 目标字符串
 */
function isWrappingWithBrackets(str: string) {
  return bracketPattern.test(str);
}

/**
 * 将表达式生成为块级代码
 * @param node
 * @returns
 */
export function expression2code(node: t.Expression) {
  const statement = t.expressionStatement(node);
  let ret = ast2code(statement).trim();
  // 移除末尾的分号
  if (ret.endsWith(';')) {
    ret = ret.slice(0, -1);
  }

  const isWrappingExpression = t.isObjectExpression(node) || t.isFunctionExpression(node);

  if (isWrappingExpression && isWrappingWithBrackets(ret)) {
    // 如果是对象，输出包含 ({})，则去掉首尾的括号
    ret = ret.slice(1, -1);
  }
  return ret;
}

/**
 * 获取成员表达式的调用名
 * @example Date.now() --> Date.now
 * @param node
 * @returns
 */
function getNameByMemberExpression(node: t.MemberExpression | t.JSXMemberExpression): string {
  let objectName;
  let propertyName;

  if (t.isIdentifier(node.object) || t.isJSXIdentifier(node.object)) {
    objectName = node.object.name;
  }

  if (t.isIdentifier(node.property) || t.isJSXIdentifier(node.property)) {
    propertyName = node.property.name;
  }

  if (t.isMemberExpression(node.object) || t.isJSXMemberExpression(node.object)) {
    objectName = getNameByMemberExpression(node.object);
  }

  if (t.isMemberExpression(node.property) || t.isJSXMemberExpression(node.property)) {
    propertyName = getNameByMemberExpression(node.property);
  }

  return `${objectName}.${propertyName}`;
}

/**
 * 将 的 jsxAttributeName 或 objectPropertyKey 转换为 js value
 * @param node jsxAttributeName or objectPropertyKey
 * @returns simple js value
 */
export function keyNode2value(node: t.Node) {
  if (!node) {
    logger.error('invalid property key', node);
    return;
  }

  let ret;

  switch (node.type) {
    case 'Identifier':
    case 'JSXIdentifier':
      ret = node.name;
      break;
    case 'StringLiteral':
      ret = `"${node.value}"`;
      break;
    case 'NumericLiteral':
      ret = node.value;
      break;
    case 'MemberExpression':
      ret = getNameByMemberExpression(node);
      break;
    case 'JSXMemberExpression':
      ret = getNameByMemberExpression(node);
      break;
    default:
      logger.error('unknown property key', node);
      break;
  }

  return ret;
}

/**
 * 将 t.Node 生成为字符串代码
 * @param node
 * @returns
 */
export function node2code(node: t.Node) {
  let ret = '';
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
      ret = node.extra.raw as string;
      break;
    case 'BooleanLiteral':
      ret = `${node.value}`;
      break;
    case 'NullLiteral':
      ret = 'null';
      break;
    default:
      ret = expression2code(node as t.Expression);
      break;
  }
  return ret;
}

/**
 * 将 t.Node 生成为 js 值
 * @param node ast node
 * @param isWrapCode 是否包裹代码，例如 code -> {{code}}
 * @returns a plain javascript value
 */
export function node2value(node: t.Node, isWrapCode = true): any {
  let ret;
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral': {
      ret = node.value;
      break;
    }
    case 'NullLiteral':
      ret = null;
      break;
    case 'Identifier': // {{data}}
    case 'MemberExpression': // {{this.props.data}}
    case 'OptionalMemberExpression': // {{a?.b}}
    case 'UnaryExpression': // {{!false}}
    case 'ArrowFunctionExpression': // {{() => {}}}
    case 'TemplateLiteral': // {{`hello ${text}`}}
    case 'ConditionalExpression': // {{a ? 'foo' : 'bar'}}
    case 'LogicalExpression': // {{ a || b}}
    case 'BinaryExpression': // {{ a + b}}
    case 'TaggedTemplateExpression': // {{css``}}
    case 'CallExpression': // {{[1,2,3].map(fn)}}
    case 'JSXElement': // {{<Box>hello</Box>}}
    case 'JSXFragment': // {{<><Box /></>}}
      ret = expression2code(node);
      if (isWrapCode) {
        ret = wrapCode(ret);
      }
      break;
    case 'ObjectExpression': {
      const isSimpleObject = node.properties.every(
        (propertyNode) => propertyNode.type === 'ObjectProperty',
      );
      if (isSimpleObject) {
        // simple object: { key1, key2, key3 }
        ret = node.properties.reduce((prev, propertyNode) => {
          if (propertyNode.type === 'ObjectProperty') {
            const key = keyNode2value(propertyNode.key);
            const value = node2value(propertyNode.value, isWrapCode);
            prev[key] = value; // key 可能是字符串，也可能是数字
          }
          return prev;
        }, {});
      } else {
        // mixed object, object property maybe SpreadElement or ObjectMethod, e.g. { key1, fn() {}, ...obj1 }
        ret = expression2code(node);
        if (wrapCode) {
          ret = wrapCode(ret);
        }
      }
      break;
    }
    case 'ArrayExpression': {
      // FIXME: 有可能会解析失败
      ret = node.elements.map((elementNode) => node2value(elementNode, isWrapCode));
      break;
    }
    default:
      logger.error('unknown ast node:', node);
      break;
  }
  return ret;
}

/**
 * jsx prop value 节点转为 js value
 */
export function jsxAttributeValueNode2value(node: t.Node): any {
  // e.g. <Checkbox checked /> 此时没有 value node
  if (!node) {
    return true;
  }

  let ret;
  switch (node.type) {
    case 'JSXExpressionContainer':
      // <Foo bar={a}>
      // <Foo bar={a.b}>
      // <Foo bar={2.2}>
      // <Foo bar={{}}>
      // <Foo bar={[]}>
      ret = jsxAttributeValueNode2value(node.expression);
      break;
    case 'ArrayExpression': {
      // 数组统一处理为 code
      ret = expression2code(node);
      ret = wrapCode(ret);
      break;
    }
    default: {
      ret = node2value(node);
      break;
    }
  }

  return ret;
}
