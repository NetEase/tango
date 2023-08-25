import type { ListenerFunction, SandpackMessage, UnsubscribeFunction } from '../types';

export class IFrameProtocol {
  // Random number to identify this instance of the client when messages are coming from multiple iframes
  readonly channelId: number = Math.floor(Math.random() * 1000000);
  // React to messages from the iframe owned by this instance
  channelListeners: Record<number, ListenerFunction> = {};
  private channelListenersCount = 0;

  private iframe: HTMLIFrameElement;
  private origin: string;

  // React to messages from any iframe
  private globalListeners: Record<number, ListenerFunction> = {};
  private globalListenersCount = 0;

  constructor(iframe: HTMLIFrameElement, origin: string) {
    // this.frameWindow = iframe.contentWindow;
    // 当在弹窗中使用 sandbox 组件时，iframe 存在，但 contentWindow 还不存在（弹窗还没弹出），需要保存 iframe
    this.iframe = iframe;
    this.origin = origin;
    this.globalListeners = [];
    this.channelListeners = [];

    this.eventListener = this.eventListener.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.eventListener);
    }
  }

  cleanup(): void {
    window.removeEventListener('message', this.eventListener);
    this.globalListeners = {};
    this.channelListeners = {};
    this.globalListenersCount = 0;
    this.channelListenersCount = 0;
  }

  // Sends the channelId and triggers an iframeHandshake promise to resolve,
  // so the iframe can start listening for messages (based on the id)
  register(): void {
    if (!this.iframe.contentWindow) {
      return;
    }

    this.iframe.contentWindow.postMessage(
      {
        type: 'register-frame',
        origin: document.location.origin,
        id: this.channelId,
      },
      this.origin,
    );
  }

  // Messages are dispatched from the client directly to the instance iframe
  dispatch(message: SandpackMessage): void {
    if (!this.iframe.contentWindow) {
      return;
    }

    this.iframe.contentWindow.postMessage(
      {
        $id: this.channelId,
        codesandbox: true,
        origin: document.location.origin,
        ...message,
      },
      this.origin,
    );
  }

  // Add a listener that is called on any message coming from an iframe in the page
  // This is needed for the `initialize` message which comes without a channelId
  globalListen(listener: ListenerFunction): UnsubscribeFunction {
    if (typeof listener !== 'function') {
      return (): void => {
        return;
      };
    }

    const listenerId = this.globalListenersCount;
    this.globalListeners[listenerId] = listener;
    this.globalListenersCount++;
    return (): void => {
      delete this.globalListeners[listenerId];
    };
  }

  // Add a listener that is called on any message coming from an iframe with the instance channelId
  // All other messages (eg: from other iframes) are ignored
  channelListen(listener: ListenerFunction): UnsubscribeFunction {
    if (typeof listener !== 'function') {
      return (): void => {
        return;
      };
    }

    const listenerId = this.channelListenersCount;
    this.channelListeners[listenerId] = listener;
    this.channelListenersCount++;
    return (): void => {
      delete this.channelListeners[listenerId];
    };
  }

  // Handles message windows coming from iframes
  private eventListener(evt: MessageEvent): void {
    // skip events originating from different iframes
    if (evt.source !== this.iframe.contentWindow) {
      return;
    }

    const message = evt.data;
    if (!message.codesandbox) {
      return;
    }

    Object.values(this.globalListeners).forEach((listener) => listener(message));

    if (message.$id !== this.channelId) {
      return;
    }

    Object.values(this.channelListeners).forEach((listener) => listener(message));
  }
}
