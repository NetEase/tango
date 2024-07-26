/**
 * code to ast
 */
import { parse, parseExpression, ParserOptions } from '@babel/parser';
import * as t from '@babel/types';
import {
  logger,
  getVariableContent,
  isPlainObject,
  Dict,
  isWrappedCode,
  getCodeOfWrappedCode,
} from '@music163/tango-helpers';

// @see https://babeljs.io/docs/en/babel-parser#pluginss
const babelParserConfig: ParserOptions = {
  sourceType: 'module',
  plugins: [
    'jsx',
    'doExpressions',
    'objectRestSpread',
    'decorators-legacy',
    'classProperties',
    'asyncGenerators',
    'functionBind',
    'dynamicImport',
    'optionalChaining',
  ],
};

/**
 * 检测代码是否是合法的代码
 * @param code
 * @returns true 为合法代码，false 为非法代码
 */
export function isValidCode(code: string) {
  try {
    parse(code, babelParserConfig);
  } catch (err) {
    return false;
  }
  return true;
}

/**
 * 检测代码是否是合法的表达式代码
 * 表达式是一组代码的集合，它返回一个值；每一个合法的表达式都能计算成某个值
 * 只要你输入这段代码，可以形成一个值，就算是表达式
 * @example x = 1; // 1
 * @example 1=1
 * @example 'hello'
 * @example { foo: 'bar' }
 * @param code
 * @returns
 */
export function isValidExpressionCode(code: string) {
  try {
    parseExpression(code, babelParserConfig);
  } catch (err) {
    return false;
  }
  return true;
}

/**
 * 将源代码解析为一棵完整的 ast 树 t.File
 * @param code
 * @returns
 */
export function code2ast(code: string): t.File {
  return parse(code, babelParserConfig);
}

/**
 * 将代码片段解析为 ast 节点
 * @example <Button>hello</Button>
 * @example { foo: 'foo' }
 * @example [{ foo: 'bar' }]
 * @example () => {}
 * @param code 输入字符串
 * @returns
 */
export function code2expression(code: string) {
  if (!code) {
    return;
  }

  if (code.endsWith(';')) {
    code = code.slice(0, -1);
  }

  let expNode;
  try {
    expNode = t.cloneNode(parseExpression(code, babelParserConfig), false, true);
  } catch (err) {
    logger.error('code2expression failed, invalid code:', code);
  }
  return expNode;
}

/**
 * 表达式代码片段转为 ast 树
 * @param code
 * @returns File
 */
export function expressionCode2ast(code: string) {
  const node = code2expression(code);
  return t.file(t.program([t.blockStatement([t.expressionStatement(node)])]));
}

/**
 * 将 js 值解析为 t.Node
 * @param value
 * @returns
 */
export function value2node(
  value: any,
):
  | t.NullLiteral
  | t.Identifier
  | t.NumericLiteral
  | t.StringLiteral
  | t.BooleanLiteral
  | t.Expression {
  let ret;
  switch (typeof value) {
    case 'string':
      if (isWrappedCode(value)) {
        // 再检查是否是代码 {{code}}，例如 {{this.foo}}, {{1}}
        const innerCode = getCodeOfWrappedCode(value);
        ret = code2expression(innerCode);
      } else {
        // 否则当成字符串处理
        ret = t.stringLiteral(value);
      }
      break;
    case 'number':
      ret = t.numericLiteral(value);
      break;
    case 'boolean':
      ret = t.booleanLiteral(value);
      break;
    case 'function':
      ret = code2expression(String(value)) as t.ArrowFunctionExpression | t.FunctionExpression;
      break;
    case 'object': {
      if (value === null) {
        ret = t.nullLiteral();
      } else if (isPlainObject(value)) {
        ret = object2node(value);
      } else if (Array.isArray(value)) {
        ret = t.arrayExpression(value.map((val) => value2node(val)));
      } else {
        ret = t.identifier('undefined');
        logger.error('value2node: not support value!', ret);
      }
      break;
    }
    case 'undefined':
      ret = t.identifier('undefined');
      break;
    default: {
      logger.error(`value2node: value <${value}> transform failed!`);
      break;
    }
  }
  return ret;
}

/**
 * 将 js 普通对象解析为 t.Node
 */
export function object2node(
  obj: Dict<any>,
  getValueNode: (value: any, key?: string) => t.Expression = value2node,
) {
  if (!isPlainObject(obj)) {
    return value2node(obj);
  }
  return t.objectExpression(
    Object.keys(obj).map((key) => {
      const valNode = getValueNode(obj[key], key);
      return t.objectProperty(t.identifier(key), valNode);
    }),
  );
}

export function code2jsxAttributeValueNode(code: string) {
  return t.jsxExpressionContainer(code2expression(code));
}

/**
 * FIXME: 统一处理为 code2jsxAttributeValueNode
 * 将 js value 转为 JSXAttributeValueNode
 * @param value js value, or wrapped code
 * @returns 返回 JSXAttributeValueNode，转换失败返回Node为 {undefined}
 */
export function value2jsxAttributeValueNode(value: any) {
  let ret;
  switch (typeof value) {
    case 'string': {
      if (value.length > 1) {
        value = value.trim();
      }
      if (isWrappedCode(value)) {
        const innerCode = getCodeOfWrappedCode(value);
        const node = code2expression(innerCode);
        ret = t.jsxExpressionContainer(node || t.identifier('undefined'));
      } else {
        ret = t.stringLiteral(value);
      }
      break;
    }
    default:
      ret = t.jsxExpressionContainer(value2node(value));
      break;
  }
  return ret;
}

export function value2jsxChildrenValueNode(value: any) {
  let ret: t.JSXElement | t.JSXFragment | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXText;
  switch (typeof value) {
    case 'string':
      if (isWrappedCode(value)) {
        // 代码模式
        const innerString = getVariableContent(value);
        ret = t.jsxExpressionContainer(code2expression(innerString));
      } else {
        // 普通的文本
        ret = t.jsxText(value);
      }
      break;
    case 'number':
      ret = t.jsxText(String(value));
      break;
    case 'object':
      // value 为 JSXElement[]的情况下直接return
      return value as t.JSXElement[];
    default:
      break;
  }
  return ret ? [ret] : [];
}

/**
 * 给定具体的 value 值，生成 JSXAttribute
 * @param name 属性名
 * @param value 属性值代码
 * @returns
 */
export function makeJSXAttribute(name: string, value: any) {
  return t.jsxAttribute(t.jsxIdentifier(name), value2jsxAttributeValueNode(value));
}

export function makeJSXAttributes(props: Dict) {
  return Object.keys(props).map((key) => makeJSXAttribute(key, props[key]));
}

/**
 * 给定具体的 value 代码，生成 JSXAttribute
 * @param name 属性名
 * @param valueCode 属性值代码
 * @returns
 */
export function makeJSXAttributeByCode(name: string, valueCode: string) {
  return t.jsxAttribute(t.jsxIdentifier(name), code2jsxAttributeValueNode(valueCode));
}

/**
 * 生成 JSXElement
 * @param name
 * @param attributes
 * @param children
 * @param selfClosing
 * @returns
 */
export function makeJSXElement(
  name: string,
  attributes: t.JSXAttribute[],
  children: t.JSXElement['children'],
  selfClosing: boolean,
) {
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(name), attributes),
    t.jsxClosingElement(t.jsxIdentifier(name)),
    children ?? [],
    selfClosing,
  );
}
