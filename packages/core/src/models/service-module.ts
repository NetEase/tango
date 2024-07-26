import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { clone, Dict, logger } from '@music163/tango-helpers';
import {
  traverseServiceFile,
  updateServiceConfigToServiceFile,
  getModuleNameByFilename,
  deleteServiceConfigFromServiceFile,
  updateBaseConfigToServiceFile,
} from '../helpers';
import { IFileConfig } from '../types';
import { IWorkspace } from './interfaces';
import { TangoModule } from './module';

/**
 * 数据服务模块
 */
export class TangoServiceModule extends TangoModule {
  /**
   * 服务函数的模块名，默认为 index
   */
  name: string;

  /**
   * 原始注册的服务函数
   * @example { get: {}, list: {} }
   */
  _serviceFunctions: Dict;

  /**
   * 原始的基础配置
   */
  _baseConfig: Dict;

  get serviceFunctions() {
    return toJS(this._serviceFunctions);
  }

  get baseConfig() {
    return toJS(this._baseConfig);
  }

  constructor(workspace: IWorkspace, props: IFileConfig) {
    super(workspace, props, false);
    this.name = getModuleNameByFilename(props.filename);
    this.update(props.code, true, false);

    makeObservable(this, {
      _serviceFunctions: observable,
      _baseConfig: observable,
      _code: observable,
      _cleanCode: observable,
      isError: observable,
      errorMessage: observable,
      serviceFunctions: computed,
      baseConfig: computed,
      cleanCode: computed,
      code: computed,
      update: action,
    });
  }

  _analysisAst() {
    const { imports, services, baseConfig } = traverseServiceFile(this.ast);
    this.importList = imports;
    this._serviceFunctions = services;
    this._baseConfig = baseConfig;
    if (baseConfig.namespace) {
      this.name = baseConfig.namespace;
    }
  }

  addServiceFunction(name: string, config: object) {
    this.ast = updateServiceConfigToServiceFile(this.ast, { [name]: clone(config, false) });
    return this;
  }

  /**
   * 批量添加服务函数
   * @param configs { [name: string]: object }
   * @returns
   */
  addServiceFunctions(configs: Dict<object>) {
    this.ast = updateServiceConfigToServiceFile(this.ast, configs);
    return this;
  }

  updateServiceFunction(name: string, payload: object) {
    this.ast = updateServiceConfigToServiceFile(this.ast, { [name]: clone(payload, false) });
    return this;
  }

  deleteServiceFunction(serviceFunctionName: string) {
    try {
      this.ast = deleteServiceConfigFromServiceFile(this.ast, serviceFunctionName);
    } catch (e) {
      logger.error(e);
    }
    return this;
  }

  /**
   * 更新服务的基础配置
   */
  updateBaseConfig(data: object) {
    this.ast = updateBaseConfigToServiceFile(this.ast, data);
    return this;
  }
}
