import { action, computed, makeObservable, observable } from 'mobx';
import { ISelectedItemData } from '@music163/tango-helpers';
import { AbstractWorkspace } from './abstract-workspace';

export enum DropMethod {
  ReplaceNode = 'replaceNode', // 替换节点
  InsertBefore = 'insertBefore', // 插入节点，放置在前面
  InsertAfter = 'insertAfter', // 插入节点，放置在后面
  InsertChild = 'insertChild', // 插入子节点，放置在最后
  InsertFirstChild = 'insertFirstChild', // 插入子节点，放置在最前
}

/**
 * 放置目标类
 */
export class DropTarget {
  /**
   * 插入方法
   */
  method: DropMethod;
  /**
   * 放置的目标元素数据
   */
  data: ISelectedItemData;

  private readonly workspace: AbstractWorkspace;

  get node() {
    return this.workspace.getNode(this.data.id, this.data.filename);
  }

  /**
   * 获取对应的 prototype
   */
  get prototype() {
    return this.data?.name ? this.workspace.getPrototype(this.data?.name) : null;
  }

  get id() {
    return this.data?.id;
  }

  get bounding() {
    return this.data?.bounding;
  }

  get display() {
    return this.data?.display;
  }

  constructor(workspace: AbstractWorkspace) {
    this.workspace = workspace;
    this.method = DropMethod.InsertAfter;
    this.data = null;

    makeObservable(this, {
      method: observable,
      data: observable,
      set: action,
      clear: action,
      node: computed,
    });
  }

  set(data: ISelectedItemData, method: DropMethod) {
    this.data = data;
    this.method = method;
  }

  /**
   * 重置
   */
  clear() {
    this.data = null;
  }

  /**
   * 获取对应的 node
   * @deprecated
   */
  getNode() {
    return this.node;
  }
}
