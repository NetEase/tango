import { isFunction } from './assert';

export function noop(...args: any[]) {}

export function runIfFn(valueOrFn: any, ...args: any[]) {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

export function callAll(...fns: any[]) {
  return function mergedFn(...args: any[]) {
    fns.forEach((fn) => {
      if (isFunction(fn)) {
        fn?.(...args);
      }
    });
  };
}
