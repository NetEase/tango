import { traverseEntryFile } from '../helpers';
import { IFileConfig } from '../types';
import { AbstractJsFile } from './abstract-js-file';
import { AbstractWorkspace } from './abstract-workspace';

export class JsAppEntryFile extends AbstractJsFile {
  routerType: string;

  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code, true, false);
  }

  _analysisAst() {
    const config = traverseEntryFile(this.ast);
    this.routerType = config?.router?.type;
  }
}
