import { Designer } from './designer';
import { IWorkspace } from './interfaces';

/**
 * 设计器引擎
 */
export class Engine {
  /**
   * 工作区状态
   */
  workspace: IWorkspace;
  /**
   * 设计器状态
   */
  designer: Designer;

  constructor(options: Pick<Engine, 'workspace' | 'designer'>) {
    this.workspace = options.workspace;
    this.designer = options.designer;
  }
}
