import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { getValue, isNil, logger, setValue } from '@music163/tango-helpers';
import type { FileType, IFileConfig } from '../types';
import { IWorkspace } from './interfaces';
import { formatCode } from '../helpers';

/**
 * 普通文件，不进行 AST 解析
 */
export class TangoFile {
  readonly workspace: IWorkspace;
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

  _code: string;
  _cleanCode: string;

  get code() {
    return this._code;
  }

  get cleanCode() {
    return this._cleanCode;
  }

  constructor(workspace: IWorkspace, props: IFileConfig, isSyncCode = true) {
    this.workspace = workspace;
    this.filename = props.filename;
    this.type = props.type;
    this.lastModified = Date.now();

    // 这里主要是为了解决 umi ts 编译错误的问题，@see https://github.com/umijs/umi/issues/7594
    if (isSyncCode) {
      this.update(props.code);
    }
  }

  /**
   * 更新文件内容
   */
  update(code?: string) {
    if (!isNil(code)) {
      this.lastModified = Date.now();
      this._code = code;
      this._cleanCode = code;
    }
    this.workspace.onFilesChange([this.filename]);
  }
}

export class TangoLessFile extends TangoFile {
  constructor(workspace: IWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code);
    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      code: computed,
      cleanCode: computed,
      update: action,
    });
  }
}

export class TangoJsonFile extends TangoFile {
  _object = {};

  /**
   * @deprecated 使用 file.json 代替
   */
  get object() {
    return toJS(this._object);
  }

  get json() {
    return toJS(this._object);
  }

  constructor(workspace: IWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.update(props.code);
    makeObservable(this, {
      _code: observable,
      _cleanCode: observable,
      _object: observable,
      code: computed,
      cleanCode: computed,
      object: computed,
      json: computed,
      update: action,
      setValue: action,
    });
  }

  update(code?: string) {
    this.lastModified = Date.now();

    if (isNil(code)) {
      // 基于最新的 json 同步代码
      let newCode = JSON.stringify(this._object);
      try {
        newCode = formatCode(newCode, 'json');
      } catch (err) {
        logger.error(err);
        return;
      }
      this._code = newCode;
      this._cleanCode = newCode;
    } else {
      try {
        // 基于传入的代码，同步 json 对象
        code = formatCode(code, 'json');
      } catch (err) {
        logger.error(err);
        return;
      }
      this._code = code;
      this._cleanCode = code;
      try {
        const json = JSON.parse(code);
        this._object = json;
      } catch (err) {
        logger.error(err);
      }
    }
    this.workspace.onFilesChange([this.filename]);
  }

  /**
   * 根据路径取值
   * @param valuePath
   * @returns
   */
  getValue(valuePath: string) {
    return getValue(this.json, valuePath);
  }

  /**
   * 根据路径设置值
   * @param valuePath
   * @param visitor
   */
  setValue(valuePath: string, visitor: (targetValue: any) => any) {
    const target = this.getValue(valuePath);
    let next: unknown;
    if (typeof visitor === 'function') {
      next = visitor?.(target);
    } else {
      next = visitor;
    }
    if (next !== undefined) {
      setValue(this._object, valuePath, next);
    }
    return this;
  }

  /**
   * 根据路径删除值
   * @param valuePath
   * @param visitor
   */
  deleteValue(valuePath: string) {
    const pathList = valuePath.split('.');
    const lastPath = pathList.pop();
    const parentPath = pathList.join('.');
    let target;
    if (parentPath) {
      target = this.getValue(parentPath);
    } else {
      target = this.json;
    }
    if (!target) {
      return this;
    }
    delete target[lastPath];
    if (parentPath) {
      this.setValue(parentPath, target);
    } else {
      this._object = target;
    }
    return this;
  }
}
