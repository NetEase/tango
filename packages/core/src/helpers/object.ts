import { ComponentPrototypeType } from '@music163/tango-helpers';
import { ImportDeclarationPayloadType } from '../types';

/**
 * 是否是简单的 js 对象
 * @param value
 * @returns
 * @see https://github.com/sindresorhus/is-plain-obj/blob/main/index.js
 */
export function isPlainObject(value: any) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  );
}

/**
 * 拷贝对象
 * @param obj 原始对象
 * @param omitKeys 忽略掉 key 列表
 * @returns 返回拷贝后的对象
 */
export function copyObject(obj: object, omitKeys: string[]) {
  const ret = {};
  Object.keys(obj).forEach((key) => {
    if (!omitKeys.includes(key)) {
      ret[key] = obj[key];
    }
  });
  return ret;
}

/**
 * 将对象的序列化字符串转为原始的 js 对象
 * @param str
 * @param defaultValue
 * @returns
 */
export function string2object(str: string, defaultValue?: any) {
  // eslint-disable-next-line no-new-func
  let ret = new Function(`return ${str}`);
  ret = ret ? ret() : defaultValue;
  return ret;
}

/**
 * 获得传入对象的类型
 * @param obj
 * @returns
 */
export function typeOf(obj?: any) {
  return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

/**
 * 导入列表解析为导入声明对象
 * @param names
 * @param nameMap
 * @returns
 */
export function namesToImportDeclarations(
  names: string[],
  nameMap: Record<string, { package: string; isDefault?: boolean }>,
) {
  const map = {};
  names.forEach((name) => {
    const mod = nameMap[name];
    if (mod) {
      updateMod(map, mod.package, name, mod.isDefault, !map[mod.package]);
    }
  });
  return Object.keys(map).map((sourcePath) => ({
    sourcePath,
    ...map[sourcePath],
  })) as ImportDeclarationPayloadType[];
}

function updateMod(
  map: any,
  fromPackage: string,
  specifier: string,
  isDefault = false,
  shouldInit = true,
) {
  if (shouldInit) {
    map[fromPackage] = {};
  }
  if (isDefault) {
    map[fromPackage].defaultSpecifier = specifier;
  } else if (map[fromPackage].specifiers) {
    map[fromPackage].specifiers.push(specifier);
  } else {
    map[fromPackage].specifiers = [specifier];
  }
}
