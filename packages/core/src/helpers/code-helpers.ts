import { getVariableContent } from '@music163/tango-helpers';
import { value2node, expression2code, isValidExpressionCode } from './ast';
import { isWrappedByExpressionContainer } from './assert';

/**
 * 将 js value 转换为代码字符串
 */
export function value2code(value: any) {
  const node = value2node(value);
  const code = expression2code(node);
  return code;
}

/**
 * 是否是字符串代码
 * @param code
 * @returns
 */
function isStringCode(code: string) {
  return /^".*"$/.test(code?.trim());
}

/**
 * js value 转为表达式代码
 * @example 1 => 1
 * @example hello => "hello"
 * @example { foo: bar } => {{ foo: bar }}
 * @example [1,2,3] => {[1,2,3]}
 *
 * @param val js value
 * @returns 表达式代码
 */
export function value2expressionCode(val: any) {
  if (!val) return '';

  let ret;

  switch (typeof val) {
    case 'string': {
      if (isValidExpressionCode(val)) {
        ret = val;
      } else if (isWrappedByExpressionContainer(val, false)) {
        ret = getVariableContent(val);
      } else if (isStringCode(val)) {
        ret = val;
      } else {
        ret = `"${val}"`;
      }
      break;
    }
    case 'number':
      ret = String(val);
      break;
    case 'object':
      ret = value2code(val);
      break;
    default:
      ret = '';
      break;
  }

  return ret;
}
