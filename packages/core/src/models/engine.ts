import { Designer } from './designer';
import { EditorState } from './editor-state';
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
  /**
   * 编辑器状态
   */
  editor: EditorState;

  constructor(options: Pick<Engine, 'workspace' | 'designer' | 'editor'>) {
    this.workspace = options.workspace;
    this.designer = options.designer;
    this.editor = options.editor;
  }
}
