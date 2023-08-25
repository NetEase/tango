import * as mobx from 'mobx';

export function isValidNestProps(props?: unknown) {
  return Array.isArray(props) && props.length > 0;
}

export function splitToPath(name: string) {
  // 可以考虑一下 foo.bar[0].buzz 中 [0] 的情况
  return name.split('.');
}

function isNumericKey(key: string) {
  return String(Number.parseInt(key)) === key;
}

/** lodash.get(...) for mobx observables */
export function observableGetIn(obj: any, key: string | string[], defaultValue?: any) {
  const path = Array.isArray(key) ? key : splitToPath(key);

  let target = obj;

  for (let i = 0; i < path.length; i += 1) {
    if (!mobx.isObservable(target)) {
      return defaultValue;
    }
    target = mobx.get(target, path[i]);
  }
  if (target === undefined) {
    return defaultValue;
  }
  return target;
}

/** lodash.set(...) for mobx observables */
export function observableSetIn(obj: unknown, key: string | string[], value: unknown) {
  const path = Array.isArray(key) ? key : splitToPath(key);
  const lastPartIndex = path.length - 1;

  let target = obj;

  for (let i = 0; i < lastPartIndex; i += 1) {
    const part = path[i];
    if (mobx.get(target, part) == null) {
      if (isNumericKey(path[i + 1])) {
        mobx.set(target, part, []);
      } else {
        mobx.set(target, part, {});
      }
    }
    target = mobx.get(target, part);
    if (!mobx.isObservable(target)) {
      return;
    }
  }
  if (mobx.isObservable(target)) {
    mobx.set(target, path[lastPartIndex], value);
  }
}
