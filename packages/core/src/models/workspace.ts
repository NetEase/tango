import { action, computed, makeObservable, observable } from 'mobx';
import { AbstractCodeWorkspace, IWorkspaceOptions } from './abstract-workspace';

/**
 * 工作区
 */
export class Workspace extends AbstractCodeWorkspace {
  constructor(options?: IWorkspaceOptions) {
    super(options);
    makeObservable(this, {
      files: observable,
      activeRoute: observable,
      activeFile: observable,
      activeViewFile: observable,
      pages: computed,
      bizComps: computed,
      fileErrors: computed,
      isValid: computed,
      setActiveRoute: action,
      setActiveFile: action,
      addFile: action,
      removeFile: action,
    });
  }
}
