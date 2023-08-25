import { Dict } from '../types';

/**
 * 获取元素上的 data 属性集
 */
export function getElementDataProps(element: HTMLElement): Dict<string> {
  return {
    ...element.dataset,
  };
}
