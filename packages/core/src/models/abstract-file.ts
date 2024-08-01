import { AbstractWorkspace } from './abstract-workspace';
import type { FileType, IFileConfig } from '../types';

/**
 * 普通文件抽象基类，不进行 AST 解析
 */
export abstract class AbstractFile {
  readonly workspace: AbstractWorkspace;
  /**
   * 文件名
   */
  readonly filename: string;

  /**
   * 文件类型
   */
  readonly type: FileType;

  /**
   * 最近修改的时间戳
   */
  lastModified: number;

  /**
   * 文件解析是否出错
   */
  isError: boolean;

  /**
   * 文件解析错误消息
   */
  errorMessage: string;

  _code: string;
  _cleanCode: string;

  get code() {
    return this._code;
  }

  // FIXME: cleanCode 是不是只有 viewFile 有 ????
  get cleanCode() {
    return this._cleanCode;
  }

  constructor(workspace: AbstractWorkspace, props: IFileConfig, isSyncCode = true) {
    this.workspace = workspace;
    this.filename = props.filename;
    this.type = props.type;
    this.lastModified = Date.now();
    this.isError = false;

    // 这里主要是为了解决 umi ts 编译错误的问题，@see https://github.com/umijs/umi/issues/7594
    if (isSyncCode) {
      this.update(props.code);
    }
  }

  /**
   * 更新文件内容
   */
  abstract update(code?: string): void;
}
