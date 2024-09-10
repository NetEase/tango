import { getValue, isNil, logger, setValue } from '@music163/tango-helpers';
import type { IFileConfig } from '../types';
import { formatCode } from '../helpers';
import { AbstractWorkspace } from './abstract-workspace';
import { AbstractFile } from './abstract-file';

export abstract class AbstractJsonFile extends AbstractFile {
  _object;

  abstract get json(): object;

  constructor(workspace: AbstractWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this._object = {};
    this.update(props.code);
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
