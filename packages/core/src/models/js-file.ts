import { action, computed, makeObservable, observable } from 'mobx';
import { IFileConfig } from '../types';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractJsFile } from './abstract-js-file';

/**
 * 普通 JS 文件
 */
export class JsFile extends AbstractJsFile {
  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code, true, false);

    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      isError: observable,
      errorMessage: observable,
      code: computed,
      cleanCode: computed,
      update: action,
      updateAst: action,
    });
  }
}
