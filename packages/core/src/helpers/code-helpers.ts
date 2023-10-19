import { isVariableString } from '@music163/tango-helpers';
import { value2node, expression2code } from './ast';

/**
 * 将 js value 转换为代码字符串
 */
export function value2code(value: any) {
  const node = value2node(value);
  const code = expression2code(node);
  return code;
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
      ret = isVariableString(val) ? val : `"${val}"`;
      break;
    }
    case 'number':
      ret = String(val);
      break;
    case 'object':
      ret = value2code(val);
      ret = `{${ret}}`;
      break;
    default:
      ret = '';
      break;
  }

  return ret;
}
