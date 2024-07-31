import { traverseEntryFile } from '../helpers';
import { IFileConfig } from '../types';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractJsFile } from './module';

export class AppEntryModule extends AbstractJsFile {
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
