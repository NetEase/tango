import { action, computed, makeObservable, observable } from 'mobx';
import {
  traverseStoreFile,
  getModuleNameByFilename,
  addStoreState,
  updateStoreState,
  removeStoreState,
} from '../helpers';
import { IFileConfig, IStorePropertyData } from '../types';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractJsFile } from './abstract-js-file';

/**
 * 状态模型模块
 */
export class JsStoreFile extends AbstractJsFile {
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
