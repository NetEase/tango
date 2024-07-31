import path from 'path';
import { action, computed, makeObservable, observable } from 'mobx';
import { IExportSpecifierData, IFileConfig } from '../types';
import { traverseComponentsEntryFile } from '../helpers';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractJsFile } from './abstract-js-file';

/**
 * 本地组件目录的入口文件，例如 '/components/index.js' 或 `/blocks/index.js`
 */
export class JsLocalComponentsEntryFile extends AbstractJsFile {
  exportList: Record<string, IExportSpecifierData>;

  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code, true, false);
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
