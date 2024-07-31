import { action, computed, makeObservable, observable, toJS } from 'mobx';
import {
  traverseStoreFile,
  traverseStoreEntryFile,
  addStoreToEntryFile,
  getModuleNameByFilename,
  addStoreState,
  updateStoreState,
  removeStoreState,
  removeStoreToEntryFile,
} from '../helpers';
import { IFileConfig, IStorePropertyData } from '../types';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractJsFile } from './module';

/**
 * 入口配置模块
 */
export class TangoStoreEntryModule extends AbstractJsFile {
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

/**
 * 状态模型模块
 */
export class TangoStoreModule extends AbstractJsFile {
  /**
   * 模块名
   */
  name: string;

  namespace: string;

  states: IStorePropertyData[];

  actions: IStorePropertyData[];

  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.name = getModuleNameByFilename(props.filename);
    this.update(props.code, true, false);

    makeObservable(this, {
      states: observable,
      actions: observable,
      _code: observable,
      _cleanCode: observable,
      cleanCode: computed,
      code: computed,
      update: action,
    });
  }

  /**
   * 添加状态属性
   * @param stateName
   * @param initValue
   */
  addState(stateName: string, initValue: string) {
    this.ast = addStoreState(this.ast, stateName, initValue);
    return this;
  }

  /**
   * 移除状态
   */
  removeState(stateName: string) {
    this.ast = removeStoreState(this.ast, stateName);
    return this;
  }

  /**
   * 更新状态代码
   * @param stateName 状态名
   * @param code 代码
   */
  updateState(stateName: string, code: string) {
    this.ast = updateStoreState(this.ast, stateName, code);
    return this;
  }

  _analysisAst() {
    const { namespace, states, actions } = traverseStoreFile(this.ast);
    this.namespace = namespace || this.name;
    this.states = states;
    this.actions = actions;
  }
}
