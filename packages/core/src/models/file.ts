import { action, computed, makeObservable, observable } from 'mobx';
import { isNil } from '@music163/tango-helpers';
import type { IFileConfig } from '../types';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractFile } from './abstract-file';

export class TangoFile extends AbstractFile {
  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code);
    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      code: computed,
      cleanCode: computed,
      update: action,
    });
  }

  update(code?: string) {
    if (!isNil(code)) {
      this.lastModified = Date.now();
      this._code = code;
      this._cleanCode = code;
    }
    this.workspace.onFilesChange([this.filename]);
  }
}
