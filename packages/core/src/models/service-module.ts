import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { clone, Dict, logger } from '@music163/tango-helpers';
import {
  traverseServiceFile,
  updateServiceConfigToServiceFile,
  getModuleNameByFilename,
  deleteServiceConfigFromServiceFile,
  updateBaseConfigToServiceFile,
} from '../helpers';
import { IFileConfig, IServiceFunctionPayload } from '../types';
import { IWorkspace } from './interfaces';
import { TangoModule } from './module';

/**
 * 数据服务模块
 */
export class TangoServiceModule extends TangoModule {
  /**
   * 模块名
   */
  name: string;

  _serviceFunctions: Dict;

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
      serviceFunctions: computed,
      baseConfig: computed,
      cleanCode: computed,
      code: computed,
      update: action,
    });
  }

  _analysisAst() {
    const { services, baseConfig } = traverseServiceFile(this.ast);
    this._serviceFunctions = services;
    this._baseConfig = baseConfig;
    if (baseConfig.namespace) {
      this.name = baseConfig.namespace;
    }
  }

  addServiceFunction(payload: IServiceFunctionPayload) {
    const { name, ...rest } = payload;
    this.ast = updateServiceConfigToServiceFile(this.ast, { [name]: clone(rest, false) });
    return this;
  }

  addServiceFunctions(payloads: IServiceFunctionPayload[]) {
    const config = payloads.reduce((acc, cur) => {
      const { name, ...rest } = cur;
      acc[name] = clone(rest, false);
      return acc;
    }, {});
    this.ast = updateServiceConfigToServiceFile(this.ast, config);
    return this;
  }

  updateServiceFunction(payload: IServiceFunctionPayload) {
    const { name, ...rest } = payload;
    this.ast = updateServiceConfigToServiceFile(this.ast, { [name]: clone(rest, false) });
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
