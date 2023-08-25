import { action, computed, makeObservable, observable } from 'mobx';
import { ISelectedItemData } from '@music163/tango-helpers';
import { DropTarget } from './drop-target';
import { IWorkspace } from './interfaces';

/**
 * 拖拽来源类，被拖拽的物体
 */
export class DragSource {
  /**
   * 是否处于拖拽状态
   */
  isDragging: boolean;

  /**
   * 选中的目标元素数据
   */
  data: ISelectedItemData;

  /**
   * 放置目标
   */
  dropTarget: DropTarget;

  private readonly workspace: IWorkspace;

  get node() {
    return this.workspace.getNode(this.data?.id, this.data?.filename);
  }

  /**
   * 获取对应的 prototype
   */
  get prototype() {
    return this.workspace.getPrototype(this.data?.name);
  }

  get id() {
    return this.data?.id;
  }

  get name() {
    return this.data?.name;
  }

  get bounding() {
    return this.data?.bounding;
  }

  constructor(workspace: IWorkspace) {
    this.workspace = workspace;
    this.data = null;
    this.isDragging = false;
    this.dropTarget = new DropTarget(workspace);

    makeObservable(this, {
      data: observable,
      isDragging: observable,
      set: action,
      clear: action,
      node: computed,
      prototype: computed,
    });
  }

  /**
   * 更新选中数据
   * @param props
   */
  set(data: ISelectedItemData) {
    this.data = data;
    this.isDragging = !!data;
  }

  /**
   * 重置
   */
  clear() {
    this.data = null;
    this.isDragging = false;
    this.dropTarget.clear();
  }

  /**
   * 获取对应的 node
   * @deprecated
   */
  getNode() {
    return this.node;
  }
}
