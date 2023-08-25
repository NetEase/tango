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
