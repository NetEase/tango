import $, { Selector } from 'cash-dom';
import {
  SLOT,
  getElementDataProps,
  MousePoint,
  ISelectedItemData,
  parseDndId,
} from '@music163/tango-helpers';

// -----------
// CONSTANTS
// -----------

export const DRAG_GHOST_ID = 'dragGhost';

export const DESIGN_SANDBOX_ID = 'sandbox-container';

export const PREVIEW_SANDBOX_ID = 'preview-sandbox-container';

// -----------
// DOM Helpers
// -----------

export function buildQueryBySlotId(id: string) {
  return `[${SLOT.dnd}="${id}"]`;
}

export function getElement(selector: Selector) {
  return $(selector).get(0);
}

export const getDragGhostElement = () => getElement(`#${DRAG_GHOST_ID}`);

export function setElementStyle(selector: Selector, style: any) {
  return $(selector).css(style);
}

/**
 * 获取元素的外框数据
 * @param element
 * @returns
 */
export function getElementBoundingData(element: HTMLElement, relativeContainer?: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const { x, y } = getRelativePoint({ x: rect.left, y: rect.top }, relativeContainer);

  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
    top: y,
    left: x,
  };
}

export function getRelativePoint(point: MousePoint, relativeContainer?: HTMLElement): MousePoint {
  let x = point.x;
  let y = point.y;
  if (relativeContainer) {
    const containerRect = relativeContainer.getBoundingClientRect();
    x -= containerRect.left;
    y -= containerRect.top;
  }
  return { x, y };
}

/**
 * 获取元素的 css display 值
 * @param element
 * @returns
 */
export function getElementCSSDisplay(element: HTMLElement) {
  return $(element).css('display');
}

/**
 * 获取元素的数据
 * @param element
 * @returns
 */
export function getElementData(
  element: HTMLElement,
  relativeContainer?: HTMLElement,
): ISelectedItemData {
  const bounding = getElementBoundingData(element, relativeContainer);
  const data = getElementDataProps(element);
  const dnd = parseDndId(data.dnd);
  const display = getElementCSSDisplay(element);
  return {
    id: dnd.id,
    codeId: dnd.codeId,
    name: dnd.component || element.tagName.toLowerCase(),
    filename: dnd.filename,
    bounding,
    element,
    display,
  };
}

/**
 * 给定点的位置到某个元素外框的距离
 * @param point
 * @param rect
 * @returns
 */
export function distanceToRect(point: any, rect: any) {
  let minX = Math.min(Math.abs(point.clientX - rect.left), Math.abs(point.clientX - rect.right));
  let minY = Math.min(Math.abs(point.clientY - rect.top), Math.abs(point.clientY - rect.bottom));
  if (point.clientX >= rect.left && point.clientX <= rect.right) {
    minX = 0;
  }
  if (point.clientY >= rect.top && point.clientY <= rect.bottom) {
    minY = 0;
  }

  return Math.sqrt(minX ** 2 + minY ** 2);
}
