import './loader';

export interface RenderOptions {
  /**
   * 应用的入口文件地址
   * @example /src/index.js
   */
  entry?: string;
  /**
   * 需要更新的目标文件路径
   */
  filenames?: any;
  /**
   * 模块调用后的回调
   */
  callback?: () => void;
}

// @ts-ignore
const seajs = window.seajs;

export function render({ entry, callback }: RenderOptions) {
  if (!entry) {
    return;
  }

  // 这里主要用于支持开发态 HMR，seajs 有缓存的话，就需要去清空掉
  if (seajs.get(entry)) {
    seajs.clear();
  }

  seajs.use([entry], callback);
}

export function refresh({ entry, callback }: RenderOptions) {
  if (!entry) {
    return;
  }

  seajs.clear();
  seajs.use([entry], callback);
}
