import * as t from '@babel/types';
import { action, computed, makeObservable, observable } from 'mobx';
import { isNil } from '@music163/tango-helpers';
import {
  code2ast,
  ast2code,
  formatCode,
  traverseFile,
  addImportDeclaration,
  updateImportDeclaration,
} from '../helpers';
import { TangoFile } from './file';
import { IFileConfig, IImportSpecifierData, ImportDeclarationDataType } from '../types';
import { IWorkspace } from './interfaces';

/**
 * JS 模块实现规范
 * - ast 操纵类方法，统一返回 this，支持外层链式调用
 * - observable state 统一用 _foo 格式，并提供 getter 方法
 */
export class TangoModule extends TangoFile {
  ast: t.File;

  /**
   * ast 是否与 code 保持同步
   */
  isAstSynced: boolean;

  /**
   * 导入的依赖列表
   */
  importList: ImportDeclarationDataType;

  constructor(workspace: IWorkspace, props: IFileConfig, isSyncCode = true) {
    super(workspace, props, isSyncCode);
  }

  /**
   * 基于最新的 ast 进行同步
   * @param code 如果传入 code，则基于 code 进行同步
   * @param isSyncAst 是否同步 ast
   * @param isRefreshWorkspace 是否刷新 workspace
   */
  update(code?: string, isSyncAst = true, isRefreshWorkspace = true) {
    this.lastModified = Date.now();

    try {
      if (isNil(code)) {
        this._syncByAst();
      } else {
        this._syncByCode(code, isSyncAst);
      }

      if (isSyncAst) {
        this._analysisAst();
      }

      this.isAstSynced = isSyncAst;
      this.isError = false;
      this.errorMessage = undefined;

      this.workspace.onFilesChange([this.filename]);
      if (isRefreshWorkspace) {
        this.workspace.refresh([this.filename]);
      }
    } catch (err: any) {
      this.isError = true;
      this.errorMessage = err.message;
    }
  }

  /**
   * 基于当前的代码重新生成 ast
   */
  updateAst() {
    if (!this.isAstSynced) {
      try {
        this.ast = code2ast(this._code);
        this._analysisAst();
        this.isAstSynced = true;
        this.isError = false;
        this.errorMessage = undefined;
      } catch (err: any) {
        this.isAstSynced = false;
        this.isError = true;
        this.errorMessage = err.message;
      }
    }
  }

  addImportDeclaration(source: string, specifiers: IImportSpecifierData[]) {
    this.ast = addImportDeclaration(this.ast, source, specifiers);
    return this;
  }

  updateImportDeclaration(source: string, specifiers: IImportSpecifierData[]) {
    this.ast = updateImportDeclaration(this.ast, source, specifiers);
    return this;
  }

  /**
   * 基于最新的 ast 进行源码同步
   */
  _syncByAst() {
    const code = ast2code(this.ast);
    this._code = code;
    this._cleanCode = code;
  }

  /**
   * 基于输入的源码进行同步
   * @param code 源码
   * @param isSyncAst 是否同步 ast
   * @returns
   */
  _syncByCode(code: string, isSyncAst = true) {
    if (code === this._code) {
      return;
    }

    // 提前格式化代码
    try {
      code = formatCode(code);
    } catch (err) {
      // err ignored, format code failed
    }

    this._code = code;
    this._cleanCode = code;
    if (isSyncAst) {
      this.ast = code2ast(code);
    }
  }

  _analysisAst() {
    const { imports } = traverseFile(this.ast);
    this.importList = imports;
  }
}

/**
 * 普通 JS 文件
 */
export class TangoJsModule extends TangoModule {
  constructor(workspace: IWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code, true, false);

    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      isError: observable,
      errorMessage: observable,
      code: computed,
      cleanCode: computed,
      update: action,
      updateAst: action,
    });
  }
}
