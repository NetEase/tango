import { ISelectedItemData, MousePoint } from '@music163/tango-helpers';
import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { AbstractWorkspace } from './abstract-workspace';
import { IViewFile } from './interfaces';

type StartDataType = {
  point: MousePoint;
  element: HTMLElement;
};

export class SelectSource {
  /**
   * 选中元素列表
   */
  _items: ISelectedItemData[] = [];

  /**
   * 用户选择的起点
   */
  _start: StartDataType = {
    point: {
      x: 0,
      y: 0,
    },
    element: null,
  };

  private readonly workspace: AbstractWorkspace;

  get start() {
    return toJS(this._start);
  }

  get first() {
    if (this._items.length) return this._items[0];
    return;
  }

  get firstNode() {
    if (!this.first) return;
    return this.workspace.getNode(this.first.id, this.first.filename);
  }

  get size() {
    return this._items.length;
  }

  /**
   * 选中的结点数据 NodeData
   */
  get selected() {
    return toJS(this._items);
  }

  /**
   * 是否选中了结点
   */
  get isSelected() {
    return !!this.selected.length;
  }

  /**
   * 选中结点位于的文件
   */
  get file(): IViewFile {
    return this.firstNode?.file;
  }

  /**
   * 选中的结点 Nodes
   */
  get nodes() {
    return this._items
      .map((item) => this.workspace.getNode(item.id, item.filename))
      .filter((node) => !!node);
  }

  constructor(workspace: AbstractWorkspace) {
    this.workspace = workspace;
    makeObservable(this, {
      _items: observable,
      _start: observable,
      select: action,
      setStart: action,
      clear: action,
      start: computed,
      selected: computed,
      first: computed,
      firstNode: computed,
      size: computed,
      isSelected: computed,
      file: computed,
      nodes: computed,
    });
  }

  // 增加一个选中项
  add() {}

  // 移除一个选中项
  remove() {}

  select(items: ISelectedItemData | ISelectedItemData[]) {
    if (!items) {
      this._items = [];
    } else {
      this._items = Array.isArray(items) ? items : [items];
    }
    // 选中后清空起点位置信息
    this._start = null;
  }

  /**
   * 选中当前选中节点的父节点
   */
  selectParent() {
    const parents = this.first?.parents || [];
    if (parents.length) {
      const [parent, ...rest] = parents;
      this.select({
        ...parent,
        parents: rest,
      });
    }
  }

  setStart(data: StartDataType) {
    this._start = data;
  }

  clear() {
    this._items = [];
  }
}
