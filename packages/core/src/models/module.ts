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
   * 导入的依赖列表
   */
  importList: ImportDeclarationDataType;

  constructor(workspace: IWorkspace, props: IFileConfig, isSyncCode = true) {
    super(workspace, props, isSyncCode);
  }

  /**
   * 基于最新的 ast 进行同步
   * @param code 如果传入 code，则基于 code 进行同步
   * @param isFormatCode 是否格式化代码
   * @param refreshWorkspace 是否刷新 workspace
   */
  update(code?: string, isFormatCode = true, refreshWorkspace = true) {
    this.lastModified = Date.now();

    try {
      if (isNil(code)) {
        this._syncByAst();
      } else {
        this._syncByCode(code, isFormatCode);
      }
      this._analysisAst();

      this.isError = false;
      this.errorMessage = undefined;

      this.workspace.onFilesChange([this.filename]);

      if (refreshWorkspace) {
        this.workspace.refresh([this.filename]);
      }
    } catch (err: any) {
      this.isError = true;
      this.errorMessage = err.message;
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
   * @param isFormatCode 是否格式化代码
   * @returns
   */
  _syncByCode(code: string, isFormatCode = true) {
    if (code === this._code) {
      return;
    }

    // 提前格式化代码
    if (isFormatCode) {
      code = formatCode(code);
    }

    this._code = code;
    this._cleanCode = code;
    this.ast = code2ast(code);
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
    this.update(props.code, false, false);

    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      isError: observable,
      errorMessage: observable,
      code: computed,
      cleanCode: computed,
      update: action,
    });
  }
}
