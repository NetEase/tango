import { isValidExpressionCode } from './ast';

const defineServiceHandlerNames = ['defineServices', 'createServices'];
const sfHandlerPattern = new RegExp(`^(${defineServiceHandlerNames.join('|')})$`);

/**
 * 判断给定的函数名是否是 defineServices
 * @param name
 * @returns
 */
export function isDefineService(name: string) {
  return sfHandlerPattern.test(name);
}

const defineStoreHandlerName = 'defineStore';

/**
 * 判断给定的函数名是否是 defineStore
 * @param name
 * @returns
 */
export function isDefineStore(name: string) {
  return defineStoreHandlerName === name;
}

/**
 * 是否是 tango 的变量引用
 * @example tango.stores.app.name
 * @example tango.stores?.app?.name
 *
 * @param name
 * @returns
 */
export function isTangoVariable(name: string) {
  return /^tango\??\.(stores|services)\??\./.test(name) && name.split('.').length > 2;
}

const templatePattern = /^{(.+)}$/s;

/**
 * 判断给定字符串是否被表达式容器`{expCode}`包裹
 * @param code
 * @deprecated 新版改为 {{code}} 作为容器
 */
export function isWrappedByExpressionContainer(code: string, isStrict = true) {
  if (isStrict && isValidExpressionCode(code)) {
    return false;
  }
  return templatePattern.test(code);
}
