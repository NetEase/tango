import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { traverseStoreEntryFile, addStoreToEntryFile, removeStoreToEntryFile } from '../helpers';
import { IFileConfig } from '../types';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractJsFile } from './abstract-js-file';

/**
 * stores 入口文件
 */
export class JsStoreEntryFile extends AbstractJsFile {
  _stores: string[] = [];

  get stores() {
    return toJS(this._stores);
  }

  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code, true, false);

    makeObservable(this, {
      _stores: observable,
      _code: observable,
      _cleanCode: observable,
      isError: observable,
      errorMessage: observable,
      stores: computed,
      code: computed,
      cleanCode: computed,
      update: action,
      updateAst: action,
    });
  }

  _analysisAst() {
    this._stores = traverseStoreEntryFile(this.ast);
  }

  /**
   * 新建模型
   * @param name
   */
  addStore(name: string) {
    this.ast = addStoreToEntryFile(this.ast, name);
    return this;
  }

  /**
   * 删除模型
   * @param name
   */
  removeStore(name: string) {
    this.ast = removeStoreToEntryFile(this.ast, name);
    return this;
  }
}
