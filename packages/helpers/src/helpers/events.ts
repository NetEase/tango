import { TangoEventName } from './enums';

type EventListenerCallbackType = (event: any) => void;

export const events = {
  /**
   * 绑定事件监听器
   * @param node HTML 元素
   * @param eventName 事件名
   * @param callback 监听器函数
   * @param useCapture 是否开启事件捕获
   * @returns { off } off 用于快速取消事件监听
   */
  on(
    node: HTMLElement | Document,
    eventName: string,
    callback: EventListenerCallbackType,
    useCapture = false,
  ) {
    if (node.addEventListener) {
      node.addEventListener(eventName, callback, useCapture);
    }

    return {
      off: () => events.off(node, eventName, callback, useCapture),
    };
  },

  /**
   * 取消事件监听器
   * @param node HTML 元素
   * @param eventName 事件名
   * @param callback 事件监听器
   * @param useCapture 是否开启事件捕获
   */
  off(
    node: HTMLElement | Document,
    eventName: string,
    callback: EventListenerCallbackType,
    useCapture = false,
  ) {
    if (node.removeEventListener) {
      node.removeEventListener(eventName, callback, useCapture);
    }
  },
};

/**
 * 触发 tangoEvent
 * @param element 发起事件的元素
 * @param eventName 事件名
 * @param eventPayload 携带的参数
 */
export function dispatchTangoEvent<E extends EventTarget, P = any>(
  element: E,
  eventName: TangoEventName,
  eventPayload?: P,
) {
  const target = element || document.body;
  target.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      detail: eventPayload,
    }),
  );
}

function getKeyboardEventFns(e: React.KeyboardEvent) {
  const fns = [];
  if (e.metaKey) {
    fns.push('meta');
  }
  if (e.ctrlKey) {
    fns.push('ctrl');
  }
  if (e.shiftKey) {
    fns.push('shift');
  }
  if (e.altKey) {
    fns.push('alt');
  }
  return fns.join('+');
}

/**
 * 获取按键的快捷信息
 */
export function getHotkey(e: React.KeyboardEvent) {
  const fn = getKeyboardEventFns(e);
  const char = e.key.toLowerCase();
  return fn ? `${fn}+${char}` : char;
}
