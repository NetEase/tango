import { action, computed, makeObservable, observable, toJS } from 'mobx';
import type { IFileConfig } from '../types';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractJsonFile } from './abstract-json-file';

export class JsonFile extends AbstractJsonFile {
  get json(): object {
    return toJS(this._object);
  }

  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props);
    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      _object: observable,
      code: computed,
      cleanCode: computed,
      json: computed,
      update: action,
      setValue: action,
    });
  }
}
