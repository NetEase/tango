import { action, computed, makeObservable, observable } from 'mobx';
import { IWorkspaceInitConfig } from './abstract-workspace';
import { AbstractCodeWorkspace } from './abstract-code-workspace';

/**
 * 工作区
 */
export class Workspace extends AbstractCodeWorkspace {
  constructor(options?: IWorkspaceInitConfig) {
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
