import path from 'path';
import { action, computed, makeObservable, observable } from 'mobx';
import { TangoModule } from './module';
import { IWorkspace } from './interfaces';
import { IFileConfig } from '../types';
import { traverseComponentsEntryFile } from '../helpers';

/**
 * 本地组件目录的入口文件，例如 '/components/index.js' 或 `/blocks/index.js`
 */
export class TangoComponentsEntryModule extends TangoModule {
  exportList: Record<string, any>;

  constructor(workspace: IWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code, false, false);
    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      exportList: observable,
      code: computed,
      cleanCode: computed,
      update: action,
    });
  }

  _analysisAst() {
    const baseDir = path.dirname(this.filename);
    const { exportMap } = traverseComponentsEntryFile(this.ast, baseDir);
    this.exportList = exportMap;
    Object.keys(this.exportList).forEach((key) => {
      this.workspace.componentPrototypes.set(key, {
        name: key,
        exportType: 'namedExport',
        package: baseDir,
        type: 'element',
      });
    });
  }
}
