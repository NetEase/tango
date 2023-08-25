import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { IWorkspace } from './interfaces';

export enum HistoryMessage {
  InitView = 'initView',
  AddFile = 'addFile',
  RemoveFile = 'removeFile',
  UpdateDependency = 'updateDependency',
  RemoveDependency = 'removeDependency',
  RemoveNode = 'removeNode',
  ReplaceNode = 'replaceNode',
  CloneNode = 'cloneNode',
  InsertNode = 'insertNode',
  DropNode = 'dropNode',
  UpdateAttribute = 'updateAttribute',
  UpdateCode = 'updateCode',
}

type HistoryRecordData = {
  [filename: string]: string;
};

interface HistoryRecord {
  time: number;
  message: HistoryMessage;
  data: HistoryRecordData;
}

type PushDataType = Pick<HistoryRecord, 'message' | 'data'>;

/**
 * 工作区的历史记录记录
 */
export class TangoHistory {
  // 历史记录
  _records: HistoryRecord[] = [];

  // 当前记录指针
  _index = 0;

  // 最多记录数
  _maxSize = 100;

  private readonly workspace: IWorkspace;

  get index() {
    return this._index;
  }

  get length() {
    return this._records.length;
  }

  get list() {
    return toJS(this._records);
  }

  get couldBack() {
    return this._records.length > 0 && this._index > -1;
  }

  get couldForward() {
    return this._records.length > this._index + 1;
  }

  constructor(workspace: IWorkspace) {
    this.workspace = workspace;

    makeObservable(this, {
      _records: observable,
      _index: observable,
      back: action,
      forward: action,
      go: action,
      push: action,
      couldBack: computed,
      couldForward: computed,
    });
  }

  _sync(data: HistoryRecordData) {
    if (data) {
      Object.keys(data).forEach((filename) => {
        this.workspace.getFile(filename).update(data[filename]);
      });
    }
  }

  /**
   * 上一步
   */
  back() {
    if (this.couldBack) {
      const item = this._records[this._index - 1];
      this._sync(item.data);
      this._index--;
    }
  }

  /**
   * 下一步
   */
  forward() {
    if (this.couldForward) {
      const item = this._records[this._index + 1];
      this._sync(item.data);
      this._index++;
    }
  }

  /**
   * 通过相对位置从历史记录加载记录
   */
  go(index: number) {
    const item = this._records[index];
    if (item) {
      this._sync(item.data);
      this._index = index;
    }
  }

  /**
   * push 数据进入历史记录堆栈
   */
  push(data: PushDataType) {
    if (this._index < this._records.length - 1) {
      this._records = this._records.slice(0, this._index + 1);
    }

    this._index = this._records.length;
    this._records.push({
      time: Date.now(),
      ...data,
    });

    const overCount = this._records.length - this._maxSize;
    if (overCount > 0) {
      this._records.splice(0, overCount);
      this._index = this._records.length - 1;
    }
  }
}
