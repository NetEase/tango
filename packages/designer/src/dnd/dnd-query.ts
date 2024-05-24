import $, { Selector } from 'cash-dom';
import { ISelectedItemData, MousePoint, SLOT } from '@music163/tango-helpers';
import {
  getElementData,
  getElementBoundingData,
  buildQueryBySlotId,
  getRelativePoint,
} from '../helpers';

export const DRAGGABLE_SELECTOR = `[${SLOT.dnd}]`;

interface DndQueryOptions {
  /**
   * DOM 查询上下文选择器
   */
  context?: string;
  /**
   * 二级上下文，适用于 iframe 中的 iframe
   */
  secondaryContext?: string;
  /**
   * 上层容器选择器
   */
  container?: string;
}

export class DndQuery {
  /**
   * dnd 上下文选择器，如果是 iframe，则是 iframe 里的 window 对象
   */
  private readonly _context: string;
  /**
   * dnd 二级上下文选择器，适用于存在 iframe 多层嵌套的场景
   */
  private readonly _secondaryContext: string;
  /**
   * 拖拽沙箱的外层容器选择器，用于辅助计算相对位置
   */
  private readonly _container: string;

  get container() {
    return this._container ? $(this._container).get(0) : undefined;
  }

  get context() {
    if (this._context) {
      // return the document object of iframe
      return this._secondaryContext
        ? $(this._context).contents().find(this._secondaryContext).contents().get(0) // iframe in iframe
        : $(this._context).contents().get(0); // iframe
    }
    return;
  }

  /**
   * 是否是隔离的沙箱环境，目前仅 iframe 环境为隔离沙箱
   */
  get isSeparated() {
    if (this.context && 'defaultView' in this.context) {
      return true;
    }
    return false;
  }

  /**
   * 沙箱内的 window 对象
   */
  get window() {
    if (this.context && 'defaultView' in this.context) {
      return (this.context as unknown as Document).defaultView;
    }
    // 否则返回当前的 window
    return window;
  }

  /**
   * 沙箱内的全局滚动偏移
   */
  get scrollTop() {
    if (this.context && 'documentElement' in this.context) {
      return (this.context as unknown as Document).documentElement.scrollTop;
    }

    return 0;
  }

  constructor({ context, secondaryContext, container }: DndQueryOptions) {
    this._context = context;
    this._secondaryContext = secondaryContext;
    this._container = container;
  }

  get(selector: Selector) {
    return $(selector, this.context);
  }

  getElement(selector: Selector) {
    return $(selector, this.context).get(0);
  }

  getElementBySlotId(slotId: string) {
    return this.getElement(buildQueryBySlotId(slotId));
  }

  getElementData(element: HTMLElement) {
    return getElementData(element, this.container);
  }

  getElementBounding(element: HTMLElement) {
    return getElementBoundingData(element, this.container);
  }

  /**
   * 获取相对容器的位置
   * @param point
   */
  getRelativePoint(point: MousePoint) {
    return getRelativePoint(point, this.container);
  }

  isChildOfElement(parentElementSlotId: string, childElementSlotId: string) {
    return !!this.get(buildQueryBySlotId(parentElementSlotId)).has(
      this.getElementBySlotId(childElementSlotId),
    ).length;
  }

  getDraggableParents(selector: Selector) {
    const closestElement = this.get(selector).closest(DRAGGABLE_SELECTOR).get(0);
    const parents = this.get(selector).parents(DRAGGABLE_SELECTOR).get();

    // 对于只有一层结构的组件，需要额外将自身加到列表里
    if (parents[0] !== closestElement) {
      parents.unshift(closestElement);
    }
    return parents;
  }

  /**
   * 获取可拖拽的子元素
   * @param selector
   * @param locateSelector
   * @returns
   */
  getDraggableDescendants(selector: Selector, descendantSelector: string = DRAGGABLE_SELECTOR) {
    return this.get(selector).find(descendantSelector).get();
  }

  getDraggableParentsData(selector: Selector, hasParents: boolean): ISelectedItemData {
    const targets = this.getDraggableParents(selector);

    if (!targets.length) {
      return;
    }

    if (hasParents) {
      const parents = targets.map((target) => this.getElementData(target));
      const closet = parents[0];

      return {
        ...closet,
        parents: parents.slice(1),
      };
    }

    return this.getElementData(targets[0]);
  }

  /**
   * 获得最近的一个可拖拽的父结点的所有子结点
   * @param selector
   * @param startPoint
   * @returns
   */
  getDraggableElementsDataByArea(selector: Selector, startPoint: MousePoint, endPoint: MousePoint) {
    const firstChildElement = this.get(selector)
      .closest(DRAGGABLE_SELECTOR)
      .find(DRAGGABLE_SELECTOR)
      .get(0);
    if (!firstChildElement) {
      return [];
    }
    let children = this.get(firstChildElement).siblings(DRAGGABLE_SELECTOR).get();
    children = [firstChildElement, ...children];
    const list: ISelectedItemData[] = [];
    children.forEach((item) => {
      const data = this.getElementData(item);
      const { left, top } = data.bounding;
      if (left > startPoint.x && top > startPoint.y && left < endPoint.x && top < endPoint.y) {
        list.push(data);
      }
    });
    return list;
  }

  scrollTo(leftOffset: number, topOffset: number) {
    this.window.scrollTo(leftOffset, topOffset);
  }

  reload() {
    let iframe;
    if (this._context) {
      // ViteSandbox
      iframe = $(this._context).contents().get(0);
    } else {
      // CodeSandbox
      iframe = this.context;
    }

    if (iframe && 'location' in iframe) {
      (iframe as unknown as Document)?.location.reload();
    }
  }
}

// 兼容旧版 API
export const DomQuery = DndQuery;
