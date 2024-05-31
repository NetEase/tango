import { traverseEntryFile } from '../helpers';
import { IFileConfig } from '../types';
import { IWorkspace } from './interfaces';
import { TangoModule } from './module';

export class AppEntryModule extends TangoModule {
  routerType: string;

  constructor(workspace: IWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code, true, false);
  }

  _analysisAst() {
    const config = traverseEntryFile(this.ast);
    this.routerType = config?.router?.type;
  }
}
