/**
 * condition 为 false 的时候打印 msg
 * @param condition
 * @param msg
 */
export function assert(condition: any, msg?: string) {
  console.assert(condition, msg);
}

export function isString(str: any): str is string {
  return typeof str === 'string';
}

export function isFunction(fn: any) {
  return typeof fn === 'function';
}

export function isNumber(num: any): num is number {
  return typeof num === 'number';
}

export function isBoolean(obj: any): obj is boolean {
  return typeof obj === 'boolean';
}

export function isObject(obj: any): obj is Record<any, any> {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

export function isPlainObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isPromise(obj: any) {
  return obj && obj.then && isFunction(obj.then);
}

/**
 * 判断值是否是 null 或 undefined
 * @param val
 * @returns true if val is null or undefined
 */
export function isNil(val: any) {
  return val == null;
}

/**
 * 是否是状态变量的 path
 * @param key
 * @returns
 */
export function isStoreVariablePath(key: string) {
  return /^stores\.[a-zA-Z0-9]+\.\w+$/.test(key);
}

/**
 * 是否是服务变量的 path
 * @param key
 * @returns
 */
export function isServiceVariablePath(key: string) {
  return /^services\.[a-zA-Z0-9]+/.test(key);
}
