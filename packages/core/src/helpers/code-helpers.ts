import { getCodeOfWrappedCode, isWrappedCode } from '@music163/tango-helpers';
import { value2node, expression2code } from './ast';

/**
 * js value 转为代码字符串
 * @example 1 => 1
 * @example hello => "hello"
 * @example { foo: bar } => {{ foo: bar }}
 * @example [1,2,3] => {[1,2,3]}
 *
 * @param val js value
 * @returns 表达式代码
 */
export function value2code(val: any) {
  if (val === undefined) {
    return '';
  }

  if (val === null) {
    return 'null';
  }

  let ret;
  switch (typeof val) {
    case 'string': {
      if (isWrappedCode(val)) {
        ret = getCodeOfWrappedCode(val);
      } else {
        ret = `"${val}"`;
      }
      break;
    }
    case 'boolean':
    case 'function':
    case 'number':
      ret = String(val);
      break;
    default: {
      // other cases, including array, object, null, undefined
      const node = value2node(val);
      ret = expression2code(node);
      break;
    }
  }

  return ret;
}

export const value2expressionCode = value2code;
