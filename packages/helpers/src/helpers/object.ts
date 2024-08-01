import get from 'lodash.get';
import set from 'lodash.set';
import { Dict } from '../types';

/**
 * 合并 target 和 source 对象，source 对象的优先级更高，如存在重名，覆盖 target 中的 key
 * @param target target object
 * @param source source object
 * @return new merged object, target will not be modified
 */
export function merge(target: object, source: object) {
  return {
    ...(target || {}),
    ...(source || {}),
  };
}

/**
 * 从目标上下文中根据 keyPath 获取对应的值
 * @param context the object to query
 * @param keyPath the path of the property to get
 * @returns
 */
export function getValue(context: any, keyPath: string) {
  keyPath = keyPath.replaceAll('?.', '.');
  return get(context, keyPath);
}

/**
 * Sets the value at path of object. If a portion of path doesn't exist, it's created. Arrays are created for missing index properties while objects are created for all other missing properties
 * @param context
 * @param keyPath
 * @param value
 * @returns
 */
export function setValue(context: any, keyPath: string, value: any) {
  return set(context, keyPath, value);
}

/**
 * 浅拷贝目标对象，并清除对象上的 undefined value
 * @param obj
 */
export function clone(obj: any, withUndefined = true) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const target: Dict = {};
  for (const key in obj) {
    if (withUndefined) {
      target[key] = obj[key];
    } else if (obj[key] !== undefined) {
      target[key] = obj[key];
    }
  }
  return target;
}

export function omit(obj: any, keys: string[]) {
  const target = clone(obj);
  for (const key of keys) {
    delete target[key];
  }
  return target;
}

export function pick(obj: any, keys: string[]) {
  const target: Dict = {};
  for (const key of keys) {
    target[key] = obj[key];
  }
  return target;
}
