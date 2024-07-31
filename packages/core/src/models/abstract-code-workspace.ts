import {
  Dict,
  isStoreVariablePath,
  parseServiceVariablePath,
  parseStoreVariablePath,
} from '@music163/tango-helpers';
import { inferFileType, getFilepath } from '../helpers';
import { TangoFile } from './file';
import { FileType } from '../types';
import { JsRouteConfigFile } from './js-route-config-file';
import { JsStoreEntryFile } from './js-store-entry-file';
import { JsServiceFile } from './js-service-file';
import { JsViewFile } from './js-view-file';
import { JsLocalComponentsEntryFile } from './js-local-components-entry-file';
import { JsAppEntryFile } from './js-app-entry-file';
import { JsFile } from './js-file';
import { AbstractWorkspace, IWorkspaceInitConfig } from './abstract-workspace';
import { JsonFile } from './json-file';
import { JsStoreFile } from './js-store-file';

/**
 * CodeWorkspace 抽象基类
 */
export abstract class AbstractCodeWorkspace extends AbstractWorkspace {
  /**
   * 模型入口配置模块
   */
  storeEntryModule: JsStoreEntryFile;

  /**
   * 状态管理模块
   */
  storeModules: Record<string, JsStoreFile>;

  /**
   * 数据服务模块
   */
  serviceModules: Record<string, JsServiceFile>;

  constructor(options: IWorkspaceInitConfig) {
    super(options);
    this.storeModules = {};
    this.serviceModules = {};
    if (options?.files) {
      this.addFiles(options.files);
    }
  }

  /**
   * 添加文件到工作区
   * @param filename 文件名
   * @param code 代码片段
   * @param fileType 模块类型
   */
  addFile(filename: string, code: string, fileType?: FileType) {
    if (!fileType && filename === this.entry) {
      fileType = FileType.JsAppEntryFile;
    }
    const moduleType = fileType || inferFileType(filename);
    const props = {
      filename,
      code,
      type: moduleType,
    };

    let module;
    switch (moduleType) {
      case FileType.JsAppEntryFile:
        module = new JsAppEntryFile(this, props);
        this.jsAppEntryFile = module;
        break;
      case FileType.StoreEntryModule:
        module = new JsStoreEntryFile(this, props);
        this.storeEntryModule = module;
        break;
      case FileType.ComponentsEntryModule:
        module = new JsLocalComponentsEntryFile(this, props);
        this.componentsEntryModule = module;
        break;
      case FileType.RouteModule: {
        module = new JsRouteConfigFile(this, props);
        this.routeModule = module;
        // check if activeRoute exists
        const route = module.routes.find((item) => item.path === this.activeRoute);
        if (!route) {
          this.setActiveRoute(module.routes[0]?.path);
        }
        break;
      }
      case FileType.JsxViewModule:
        module = new JsViewFile(this, props);
        break;
      case FileType.ServiceModule:
        module = new JsServiceFile(this, props);
        this.serviceModules[module.name] = module;
        break;
      case FileType.StoreModule:
        module = new JsStoreFile(this, props);
        this.storeModules[module.name] = module;
        break;
      case FileType.Module:
        module = new JsFile(this, props);
        break;
      case FileType.PackageJson:
        module = new JsonFile(this, props);
        this.packageJson = module;
        break;
      case FileType.TangoConfigJson:
        module = new JsonFile(this, props);
        this.tangoConfigJson = module;
        break;
      case FileType.Json:
        module = new JsonFile(this, props);
        break;
      default:
        module = new TangoFile(this, props);
    }

    this.files.set(filename, module);
  }

  addServiceFile(serviceName: string, code: string) {
    const filename = `/src/services/${serviceName}.js`;
    this.addFile(filename, code, FileType.ServiceModule);
    const indexServiceModule = this.serviceModules.index;
    indexServiceModule?.addImportDeclaration(`./${serviceName}`, []).update();
  }

  addStoreFile(storeName: string, code: string) {
    const filename = `/src/stores/${storeName}.js`;
    this.addFile(filename, code);
    if (!this.storeEntryModule) {
      this.addFile('/src/stores/index.js', '');
    }
    this.storeEntryModule.addStore(storeName).update();
  }

  /**
   * 添加新的模型文件
   * @deprecated 使用 addStoreFile 代替
   */
  addStoreModule(name: string, code: string) {
    this.addStoreFile(name, code);
  }

  /**
   * 删除模型文件
   * @param name
   */
  removeStoreModule(name: string) {
    const filename = getFilepath(name, '/src/stores', '.js');
    this.storeEntryModule.removeStore(name).update();
    this.removeFile(filename);
  }

  /**
   * 添加模型属性
   * @param storeName
   * @param stateName
   * @param initValue
   */
  addStoreState(storeName: string, stateName: string, initValue: string) {
    this.storeModules[storeName]?.addState(stateName, initValue).update();
  }

  /**
   * 删除模型属性
   * @param storeName
   * @param stateName
   */
  removeStoreState(storeName: string, stateName: string) {
    this.storeModules[storeName]?.removeState(stateName).update();
  }

  /**
   * 根据变量路径删除状态变量
   * @param variablePath
   */
  removeStoreVariable(variablePath: string) {
    const { storeName, variableName } = parseStoreVariablePath(variablePath);
    this.removeStoreState(storeName, variableName);
  }

  /**
   * 根据变量路径更新状态变量的值
   * @param variablePath 变量路径
   * @param code 变量代码
   */
  updateStoreVariable(variablePath: string, code: string) {
    if (isStoreVariablePath(variablePath)) {
      const { storeName, variableName } = parseStoreVariablePath(variablePath);
      this.storeModules[storeName]?.updateState(variableName, code).update();
    }
  }

  /**
   * 获取服务函数的详情
   * TODO: 不要 services 前缀
   * @param serviceKey `services.list` 或 `services.sub.list`
   * @returns
   */
  getServiceFunction(serviceKey: string) {
    const { name, moduleName } = parseServiceVariablePath(serviceKey);
    if (!name) {
      return;
    }

    return {
      name,
      moduleName,
      config: this.serviceModules[moduleName]?.serviceFunctions[name],
    };
  }

  /**
   * 获取服务函数的列表
   * @returns 返回服务函数的列表 { [serviceKey: string]: Dict }
   */
  listServiceFunctions() {
    const ret: Record<string, Dict> = {};
    Object.keys(this.serviceModules).forEach((moduleName) => {
      const module = this.serviceModules[moduleName];
      Object.keys(module.serviceFunctions).forEach((name) => {
        const serviceKey = moduleName === 'index' ? name : [moduleName, name].join('.');
        ret[serviceKey] = module.serviceFunctions[name];
      });
    });
    return ret;
  }

  /**
   * 更新服务函数
   */
  updateServiceFunction(serviceName: string, payload: Dict, moduleName = 'index') {
    this.serviceModules[moduleName].updateServiceFunction(serviceName, payload).update();
  }

  /**
   * 新增服务函数，支持批量添加
   */
  addServiceFunction(name: string, config: Dict, moduleName = 'index') {
    this.serviceModules[moduleName]?.addServiceFunction(name, config).update();
  }

  addServiceFunctions(configs: Dict<Dict>, modName = 'index') {
    this.serviceModules[modName]?.addServiceFunctions(configs).update();
  }

  /**
   * 删除服务函数
   * @param name
   */
  removeServiceFunction(serviceKey: string) {
    const { moduleName, name } = parseServiceVariablePath(serviceKey);
    this.serviceModules[moduleName]?.deleteServiceFunction(name).update();
  }

  /**
   * 更新服务的基础配置
   */
  updateServiceBaseConfig(config: Dict, moduleName = 'index') {
    this.serviceModules[moduleName]?.updateBaseConfig(config).update();
  }
}
