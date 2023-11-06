import { action, computed, makeObservable, observable } from 'mobx';
import { JSXElement } from '@babel/types';
import {
  array2object,
  ComponentPrototypeType,
  hasFileExtension,
  isString,
  logger,
  uniq,
} from '@music163/tango-helpers';
import {
  prototype2jsxElement,
  inferFileType,
  getFilepath,
  isPathnameMatchRoute,
  getJSXElementChildrenNames,
  namesToImportDeclarations,
  getBlockNameByFilename,
  getPrivilegeCode,
} from '../helpers';
import { DropMethod } from './drop-target';
import { HistoryMessage, TangoHistory } from './history';
import { TangoNode } from './node';
import { TangoJsModule } from './module';
import { TangoFile, TangoJsonFile, TangoLessFile } from './file';
import { IWorkspace } from './interfaces';
import {
  IFileConfig,
  FileType,
  ITangoConfigPackages,
  IPageConfigData,
  IServiceFunctionPayload,
} from '../types';
import { SelectSource } from './select-source';
import { DragSource } from './drag-source';
import { TangoRouteModule } from './route-module';
import { TangoStoreEntryModule, TangoStoreModule } from './store-module';
import { TangoServiceModule } from './service-module';
import { TangoViewModule } from './view-module';

export interface IWorkspaceOptions {
  /**
   * 入口文件
   */
  entry?: string;
  /**
   * 初始化文件列表
   */
  files?: IFileConfig[];
  /**
   * 默认的激活的路由
   */
  defaultActiveRoute?: string;
  /**
   * 组件描述列表
   */
  prototypes?: Record<string, ComponentPrototypeType>;
  /**
   * 工作区文件变更事件
   */
  onFilesChange?: (filenames: string[]) => void;
}

/**
 * 工作区
 */
export class Workspace extends EventTarget implements IWorkspace {
  history: TangoHistory;
  selectSource: SelectSource;
  dragSource: DragSource;

  /**
   * 工作区的文件列表
   */
  files: Map<string, TangoFile>;

  componentPrototypes: Map<string, ComponentPrototypeType>;

  entry: string;

  /**
   * 当前路由
   */
  activeRoute: string;

  /**
   * 当前选中的文件
   */
  activeFile: string;

  /**
   * 当前选中的视图文件
   */
  activeViewFile: string;

  /**
   * 本地区块 { [blockName]: filePath }
   * FIXME: 修正类型 Record<string, TangoBlockModule>
   */
  localBlocks: Record<string, string>;

  /**
   * 路由配置模块
   */
  routeModule: TangoRouteModule;

  /**
   * 模型入口配置模块
   */
  storeEntryModule: TangoStoreEntryModule;

  storeModules: Record<string, TangoStoreModule> = {};

  serviceModules: Record<string, TangoServiceModule> = {};

  /**
   * package.json 文件
   */
  packageJson: TangoJsonFile;

  /**
   * tango.config.json 文件
   */
  tangoConfigJson: TangoJsonFile;

  /**
   * appJson.json 文件
   * FIXME: 是否保留 ???
   */
  appJson: TangoJsonFile;

  /**
   * 代码变更回调
   */
  onFilesChange?: (filenames: string[]) => void;

  /**
   * 绑定事件
   * TODO: 是否需要自己来管理 listeners，并及时进行 gc
   */
  on = this.addEventListener;

  /**
   * 移除事件
   */
  off = this.removeEventListener;

  /**
   * 工作区是否就绪
   */
  private isReady: boolean;

  /**
   * 拷贝的暂存区
   */
  private copyTempNodes: TangoNode[];

  /**
   * 当前激活的视图模块
   */
  get activeViewModule() {
    if (!this.activeViewFile) {
      this.setActiveViewFile(this.activeRoute);
    }
    return this.files.get(this.activeViewFile) as TangoViewModule;
  }

  /**
   * 获取页面列表
   */
  get pages() {
    const appJsonPages = this.appJson?.getValue('pages');
    const pagesMap = array2object(appJsonPages || [], (item) => item.path);
    const ret: IPageConfigData[] = [];
    this.routeModule?.routes.forEach((item) => {
      const data = pagesMap[item.path];
      if (item.path !== '*') {
        ret.push({
          ...data,
          path: item.path,
        });
      }
    });
    return ret;
  }

  get bizComps(): string[] {
    const packages = this.tangoConfigJson?.getValue('packages');
    let list = this.tangoConfigJson?.getValue('bizDependencies') || [];
    if (packages) {
      list = [
        ...new Set([
          ...list,
          ...Object.keys(packages).filter((e) => packages[e].type === 'bizDependency'),
        ]),
      ];
    }
    return list;
  }

  get baseComps(): string[] {
    const packages = this.tangoConfigJson?.getValue('packages');
    let list = this.tangoConfigJson?.getValue('baseDependencies') || [];
    if (packages) {
      list = [
        ...new Set([
          ...list,
          ...Object.keys(packages).filter((e) => packages[e].type === 'baseDependency'),
        ]),
      ];
    }
    return list;
  }

  get blocks() {
    return Object.keys(this.localBlocks);
  }

  constructor(options?: IWorkspaceOptions) {
    super();
    this.history = new TangoHistory(this);
    this.selectSource = new SelectSource(this);
    this.dragSource = new DragSource(this);
    this.componentPrototypes = new Map();
    this.localBlocks = {};
    this.entry = options?.entry;
    this.activeRoute = options?.defaultActiveRoute || '/';
    this.activeFile = options?.entry;
    this.activeViewFile = '';
    this.files = new Map();
    this.isReady = false;
    this.onFilesChange = options?.onFilesChange;

    if (options?.files) {
      this.addFiles(options.files);
    }

    if (options?.prototypes) {
      this.setComponentPrototypes(options.prototypes);
    }

    makeObservable(this, {
      files: observable,
      activeRoute: observable,
      activeFile: observable,
      activeViewFile: observable,
      localBlocks: observable,
      blocks: computed,
      pages: computed,
      bizComps: computed,
      setActiveRoute: action,
      setActiveFile: action,
      addFile: action,
      removeFile: action,
    });
  }

  getPrototype(name: string | ComponentPrototypeType) {
    if (isString(name)) {
      return this.componentPrototypes.get(name);
    }
    return name as ComponentPrototypeType;
  }

  /**
   * 设置当前路由
   * @param routePath 路由路径
   */
  setActiveRoute(routePath: string) {
    if (routePath === this.activeRoute) {
      return;
    }
    this.selectSource.clear();
    this.activeRoute = routePath;
    this.setActiveViewFile(routePath);
  }

  /**
   * 设置当前选中的文件
   * @param filename
   */
  setActiveFile(filename: string, isViewFile = false) {
    this.activeFile = filename;
    if (isViewFile) {
      this.activeViewFile = filename;
    }
  }

  /**
   * 根据当前的路由计算当前的视图模块
   */
  setActiveViewFile(routePath: string) {
    let filename = this.getFilenameByRoutePath(routePath);
    if (!filename) {
      // 没有找到 route 对应的文件，使用默认的 entry
      for (const [key, file] of this.files) {
        if (file.type === FileType.JsxViewModule) {
          filename = file.filename;
          break;
        }
      }
    }
    if (filename) {
      this.setActiveFile(filename, true);
    }
  }

  setComponentPrototypes(prototypes: Record<string, ComponentPrototypeType>) {
    Object.keys(prototypes).forEach((name) => {
      this.componentPrototypes.set(name, prototypes[name]);
    });
  }

  /**
   * 添加一组文件到工作区
   * @param files
   */
  addFiles(files: IFileConfig[] = []) {
    files.forEach((file) => {
      this.addFile(file.filename, file.code, file.type);
    });
  }

  /**
   * 添加文件到工作区
   * @param filename 文件名
   * @param code 代码片段
   * @param fileType 模块类型
   */
  addFile(filename: string, code: string, fileType?: FileType) {
    if (!this.files.has(filename)) {
      const moduleType = fileType || inferFileType(filename);
      const props = {
        filename,
        code,
        type: moduleType,
      };

      let module;
      switch (moduleType) {
        case FileType.StoreEntryModule:
          module = new TangoStoreEntryModule(this, props);
          this.storeEntryModule = module;
          break;
        case FileType.RouteModule: {
          module = new TangoRouteModule(this, props);
          this.routeModule = module;
          // check if activeRoute exists
          const route = module.routes.find((item) => item.path === this.activeRoute);
          if (!route) {
            this.setActiveRoute(module.routes[0]?.path);
          }
          break;
        }
        case FileType.JsxViewModule:
          module = new TangoViewModule(this, props);
          break;
        case FileType.ServiceModule:
          module = new TangoServiceModule(this, props);
          this.serviceModules[module.name] = module;
          break;
        case FileType.StoreModule:
          module = new TangoStoreModule(this, props);
          this.storeModules[module.name] = module;
          break;
        case FileType.BlockEntryModule: {
          const blockName = getBlockNameByFilename(props.filename);
          const prototype: ComponentPrototypeType = {
            name: blockName,
            exportType: 'defaultExport',
            package: props.filename,
            type: 'block',
          };
          this.localBlocks[blockName] = props.filename;
          this.componentPrototypes.set(blockName, prototype);
          module = new TangoViewModule(this, props);
          break;
        }
        case FileType.Module:
          module = new TangoJsModule(this, props);
          break;
        case FileType.Less:
          module = new TangoLessFile(this, props);
          break;
        case FileType.PackageJson:
          module = new TangoJsonFile(this, props);
          this.packageJson = module;
          break;
        case FileType.TangoConfigJson:
          module = new TangoJsonFile(this, props);
          this.tangoConfigJson = module;
          break;
        case FileType.AppJson:
          module = new TangoJsonFile(this, props);
          this.appJson = module;
          break;
        case FileType.Json:
          module = new TangoJsonFile(this, props);
          break;
        default:
          module = new TangoFile(this, props);
      }

      this.files.set(filename, module);
    }
  }

  updateFile(filename: string, code: string, shouldFormatCode = false) {
    const file = this.getFile(filename);
    file.update(code);
    if (shouldFormatCode && file instanceof TangoViewModule) {
      file.removeUnusedImportSpecifiers().update();
    }
    this.history.push({
      message: HistoryMessage.UpdateCode,
      data: {
        [filename]: code,
      },
    });
  }

  /**
   * 删除工作区的文件
   * @param filename
   */
  removeFile(filename: string) {
    // TODO: refactor visitFile to share this logic
    if (this.files.get(filename)) {
      // 如果是文件，直接删除
      this.files.delete(filename);
    } else {
      // 没有匹配到，就是一个目录，直接删除整个目录
      // FIXME: 可能存在风险，如果文件夹中的模块被复用，则会导致误删除
      Array.from(this.files.keys()).forEach((key) => {
        if (key.startsWith(`${filename}/`)) {
          this.files.delete(key);
        }
      });
    }
  }

  /**
   * 重命名文件
   * @param oldFilename
   * @param newFilename
   */
  renameFile(oldFilename: string, newFilename: string) {
    const file = this.files.get(oldFilename);
    if (file) {
      this.removeFile(oldFilename);
      this.addFile(newFilename, file.code);
    }
  }

  /**
   * 重命名文件夹
   * @param oldFoldername 旧文件夹名
   * @param newFoldername 新文件夹名
   */
  renameFolder(oldFoldername: string, newFoldername: string) {
    Array.from(this.files.keys()).forEach((key) => {
      if (key.startsWith(`${oldFoldername}/`)) {
        const newKey = key.replace(oldFoldername, newFoldername);
        this.renameFile(key, newKey);
      }
    });
  }

  /**
   * 根据文件名获取文件对象
   * @param filename
   * @returns
   */
  getFile(filename: string) {
    return this.files.get(filename);
  }

  /**
   * 获取文件列表
   * @returns { [filename]: fileCode }
   */
  listFiles() {
    const ret = {};
    this.files.forEach((file) => {
      ret[file.filename] = file.cleanCode;
    });
    return ret;
  }

  /**
   * 删除视图模块
   * @param route 路由名称
   */
  removeViewModule(routePath: string) {
    // get filename first
    const filename = this.getFilenameByRoutePath(routePath);
    if (this.routeModule) {
      this.routeModule.removeRoute(routePath).update();
      this.setActiveRoute(this.routeModule.routes[0]?.path || '/');
    }
    // remove appJson page
    this.appJson
      ?.setValue('pages', (pages) => {
        return (pages as IPageConfigData[]).filter((page) => page.path !== routePath);
      })
      .update();
    this.removeFile(filename);
  }

  /**
   * 添加新的视图文件
   * @deprecated
   * @param route 视图名
   * @param code 视图代码
   */
  addViewPage(routeConfig: string | IPageConfigData, code: string) {
    const config =
      typeof routeConfig === 'string'
        ? {
            name: routeConfig,
            path: routeConfig.startsWith('/') ? routeConfig : `/${routeConfig}`,
          }
        : routeConfig;

    const filename = getFilepath(config.path, '/src/pages', '.js');
    this.addFile(filename, code);
    this.addRoute(config, filename);
  }

  /**
   * 添加新的路由
   */
  addRoute(routeData: IPageConfigData, importFilePath: string) {
    this.routeModule?.addRoute(routeData.path, importFilePath).update();
    this.appJson
      ?.setValue('pages', (pages) => {
        (pages as IPageConfigData[]).push({
          name: routeData.name || routeData.path,
          path: routeData.path,
          privilegeCode: getPrivilegeCode(this.packageJson?.getValue('name'), routeData.path),
        });
        return pages;
      })
      .update();
  }

  /**
   * 更新页面路由配置
   * @param sourceRoutePath
   * @param targetPageData
   */
  updateRoute(sourceRoutePath: string, targetPageData: IPageConfigData) {
    if (sourceRoutePath !== targetPageData.path) {
      this.routeModule?.updateRoute(sourceRoutePath, targetPageData.path).update();
    }
    this.appJson
      ?.setValue('pages', (pages) => {
        for (const page of pages as IPageConfigData[]) {
          if (page.path === sourceRoutePath) {
            page.path = targetPageData.path;
            page.name = targetPageData.name;
            break;
          }
        }
        return pages;
      })
      .update();
  }

  /**
   * 复制视图文件
   * @param sourceRoute
   * @param targetRouteConfig
   */
  copyViewPage(sourceRoutePath: string, targetPageData: IPageConfigData) {
    const sourceFilePath = this.getRealViewFilePath(this.getFilenameByRoutePath(sourceRoutePath));
    const targetFilePath = getFilepath(targetPageData.path, '/src/pages');
    this.copyFiles(sourceFilePath, targetFilePath);
    this.addRoute(targetPageData, targetFilePath);
  }

  getNode(id: string, filename?: string) {
    const file = filename ? this.getFile(filename) : this.activeViewModule;
    if (file instanceof TangoViewModule) {
      return file.getNode(id);
    }
  }

  /**
   * 应用代码初始化完成
   */
  ready() {
    if (!this.isReady) {
      this.isReady = true;

      this.history.push({
        message: HistoryMessage.InitView,
        data: {
          [this.activeViewModule?.filename]: this.activeViewModule?.code,
        },
      });
    }
  }

  /**
   * 添加新的模型文件
   * @param name 模型名
   * @param code 模型代码
   */
  addStoreModule(name: string, code: string) {
    const filename = `/src/stores/${name}.js`;
    this.addFile(filename, code);
    if (!this.storeEntryModule) {
      this.addFile('/src/stores/index.js', '');
    }
    this.storeEntryModule.addStore(name).update();
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
   * 根据变量路径更新模块内容
   * TODO: 改名，不直观
   * @param variablePath 变量路径
   * @param code 变量代码
   */
  updateModuleCodeByVariablePath(variablePath: string, code: string) {
    if (/^stores\.\w+\.\w+$/.test(variablePath)) {
      const [, storeName, stateName] = variablePath.split('.');
      this.storeModules[storeName]?.updateState(stateName, code).update();
    }
  }

  /**
   * 获取服务函数的详情
   * TODO: 不要 services 前缀
   * @param serviceKey `services.list` 或 `services.sub.list`
   * @returns
   */
  getServiceFunction(serviceKey: string) {
    const { name, moduleName } = this.parseServiceKey(serviceKey);
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
   */
  listServiceFunctions() {
    const ret: Record<string, object> = {};
    Object.values(this.serviceModules).forEach((module) => {
      Object.keys(module.serviceFunctions).forEach((name) => {
        const serviceKey =
          module.baseConfig.namespace !== 'index'
            ? name
            : [module.baseConfig.namespace, name].join('.');
        ret[serviceKey] = module.serviceFunctions[name];
      });
    });
    return ret;
  }

  /**
   * 更新服务函数
   */
  updateServiceFunction(payload: IServiceFunctionPayload, moduleName = 'index') {
    this.serviceModules[moduleName].updateServiceFunction(payload).update();
  }

  /**
   * 新增服务函数，支持批量添加
   */
  addServiceFunction(
    payload: IServiceFunctionPayload | IServiceFunctionPayload[],
    moduleName = 'index',
  ) {
    if (Array.isArray(payload)) {
      this.serviceModules[moduleName]?.addServiceFunctions(payload).update();
    } else {
      this.serviceModules[moduleName]?.addServiceFunction(payload).update();
    }
  }

  /**
   * 删除服务函数
   * @param name
   */
  removeServiceFunction(name: string, moduleName = 'index') {
    this.serviceModules[moduleName]?.deleteServiceFunction(name).update();
  }

  /**
   * 更新服务的基础配置
   */
  updateServiceBaseConfig(config: object, moduleName = 'index') {
    this.serviceModules[moduleName]?.updateBaseConfig(config).update();
  }

  /**
   * 获取 package.json 中的依赖列表
   * @returns
   * TODO: fix this logic to merge dependencies from package.json and tango.config.json
   */
  listDependencies() {
    return this.packageJson?.getValue('dependencies');
  }

  getDependencies(pkgName: string) {
    const packages = this.tangoConfigJson?.getValue('packages');
    const dependencies = this.packageJson?.getValue('dependencies'); // 兼容老版本
    const detail = {
      version: dependencies?.[pkgName],
      ...(packages?.[pkgName] || {}),
    };
    return detail;
  }

  /**
   * 更新依赖，没有就添加
   * @param name
   * @param version
   */
  updateDependency(
    name: string,
    version: string,
    options?: {
      package?: ITangoConfigPackages;
      [x: string]: any;
    },
  ) {
    this.packageJson
      ?.setValue('dependencies', (deps = {}) => {
        deps[name] = version;
        return deps;
      })
      .update();

    this.tangoConfigJson
      ?.setValue('packages', (packages) => {
        // 兼容以前的逻辑，只在拥有 package 参数时，才会更新 packages 字段
        if (!packages) {
          return undefined;
        }
        if (options?.package || packages[name]) {
          packages[name] = {
            type: packages[name]?.type,
            // 如果没有传入 package 信息，则沿用 tango.config.json 中已记录的数据
            // 如果传入了，则全量使用传入的信息，适配可能在某个版本中如 resources 等字段被删除的情况
            ...(options?.package || packages[name]),
            version,
          };
        }

        return packages;
      })
      .update();

    this.history.push({
      message: HistoryMessage.UpdateDependency,
      data: {
        [this.packageJson.filename]: this.packageJson.code,
      },
    });
  }

  /**
   * 移除依赖
   * @param name
   */
  removeDependency(name: string) {
    this.packageJson
      ?.setValue('dependencies', (deps) => {
        if (deps[name]) {
          delete deps[name];
        }
        return deps;
      })
      .update();

    this.tangoConfigJson
      ?.setValue('packages', (packages = {}) => {
        if (packages?.[name]) {
          delete packages[name];
        }

        return packages;
      })
      .update();

    this.history.push({
      message: HistoryMessage.RemoveDependency,
      data: {
        [this.packageJson.filename]: this.packageJson.code,
      },
    });
  }

  /**
   * 删除业务组件
   * @param name
   */
  removeBizComp(name: string) {
    this.tangoConfigJson
      ?.setValue('bizDependencies', (deps?: string[]) => {
        if (!deps) {
          return undefined;
        }
        return deps.filter((dep) => dep !== name);
      })
      .update();
    this.removeDependency(name);
  }

  /**
   * 添加业务组件
   * @param name
   */
  addBizComp(
    name: string,
    version: string,
    options?: {
      package?: ITangoConfigPackages;
      [x: string]: any;
    },
  ) {
    const packages = this.tangoConfigJson.getValue('packages');
    this.updateDependency(name, version, {
      ...options,
      ...(!!packages && {
        package: {
          ...options?.package,
          type: 'bizDependency',
        },
      }),
    });

    // 兼容以前的逻辑
    if (!options?.package && !packages) {
      // TODO: if tangoConfigJson not found, init this file
      this.tangoConfigJson
        ?.setValue('bizDependencies', (deps: string[] = []) => {
          if (!deps.includes(name)) {
            deps.push(name);
          }
          return deps;
        })
        .update();
    }

    this.tangoConfigJson &&
      this.history.push({
        message: HistoryMessage.UpdateDependency,
        data: {
          [this.tangoConfigJson.filename]: this.tangoConfigJson.code,
        },
      });
  }

  /**
   * 删除选中节点
   */
  removeSelectedNode() {
    const file = this.selectSource.file;
    if (!file) return;

    // 选中的结点一定位于相同的文件中
    this.selectSource.nodes.forEach((node) => {
      file.removeNode(node.id);
    });
    file.update();
    this.selectSource.clear();
    this.history.push({
      message: HistoryMessage.RemoveNode,
      data: {
        [file.filename]: file.code,
      },
    });
  }

  /**
   * 复制选中结点
   */
  copySelectedNode() {
    this.copyTempNodes = this.selectSource.nodes as TangoNode[];
  }

  /**
   * 粘贴选中结点
   * TODO: 重构该逻辑，抽离出公共的方法
   */
  pasteSelectedNode() {
    if (this.selectSource.size !== 1) return;
    if (!this.copyTempNodes) return;

    // TODO: 潜在隐患，如果跨页的话，代码里的逻辑调用也要处理

    const importDeclarations = this.getImportDeclarationByNodes(
      this.copyTempNodes.map((node) => node.rawNode),
    );

    importDeclarations.forEach((importDeclaration) => {
      this.activeViewModule.updateImportSpecifiers(importDeclaration);
    });

    this.copyTempNodes.forEach((node) => {
      this.activeViewModule.insertAfter(this.selectSource.first.id, node.cloneRawNode());
    });

    this.activeViewModule.update();

    this.history.push({
      message: HistoryMessage.CloneNode,
      data: {
        [this.activeViewModule.filename]: this.activeViewModule.code,
      },
    });
  }

  /**
   * 克隆选中节点，追加到当前结点的后方
   */
  cloneSelectedNode() {
    const file = this.selectSource.file;
    file
      .insertAfter(
        this.selectSource.first.id,
        this.selectSource.firstNode.cloneRawNode() as JSXElement,
      )
      .update();

    this.history.push({
      message: HistoryMessage.CloneNode,
      data: {
        [file.filename]: file.code,
      },
    });
  }

  /**
   * 在目标节点中插入子节点
   * @param targetNodeId 目标节点dnd-id
   * @param sourceName 插入的组件名称
   * @returns
   */
  insertToNode(targetNodeId: string, sourceName: string | ComponentPrototypeType) {
    if (!targetNodeId || !sourceName) {
      return;
    }

    const sourcePrototype = this.getPrototype(sourceName);
    const newNode = prototype2jsxElement(sourcePrototype);
    const file = this.getNode(targetNodeId).file;
    file.insertChild(targetNodeId, newNode, 'last', sourcePrototype).update();
    this.history.push({
      message: HistoryMessage.InsertNode,
      data: {
        [file.filename]: file.code,
      },
    });
  }

  /**
   * 替换目标节点
   */
  replaceNode(targetNodeId: string, sourceName: string | ComponentPrototypeType) {
    if (!targetNodeId || !sourceName) {
      return;
    }

    const sourcePrototype = this.getPrototype(sourceName);
    const newNode = prototype2jsxElement(sourcePrototype);
    const file = this.getNode(targetNodeId).file;
    file.replaceNode(targetNodeId, newNode, sourcePrototype).update();
    this.history.push({
      message: HistoryMessage.ReplaceNode,
      data: {
        [file.filename]: file.code,
      },
    });
  }

  /**
   * 在选中节点中插入子节点
   * @param childName 节点名
   */
  insertToSelectedNode(childName: string | ComponentPrototypeType) {
    const insertedPrototype = this.getPrototype(childName);
    if (insertedPrototype) {
      const newNode = prototype2jsxElement(insertedPrototype);
      const file = this.selectSource.file;
      file.insertChild(this.selectSource.first.id, newNode, 'last', insertedPrototype).update();
      this.history.push({
        message: HistoryMessage.InsertNode,
        data: {
          [file.filename]: file.code,
        },
      });
    }
  }

  updateSelectedNodeAttributes(
    attributes: Record<string, any> = {},
    relatedImports: string[] = [],
  ) {
    const file = this.selectSource.file;
    file.updateNodeAttributes(this.selectSource.first.id, attributes, relatedImports).update();
    this.history.push({
      message: HistoryMessage.UpdateAttribute,
      data: {
        [file.filename]: file.code,
      },
    });
  }

  /**
   * 将节点拽入视图中
   */
  dropNode() {
    const dragSource = this.dragSource;
    const dropTarget = dragSource.dropTarget;

    if (!dragSource.prototype || !dropTarget.id) {
      // 无效的 drag source 或 drop target，提前退出
      logger.error('invalid dragSource or dropTarget');
      return;
    }

    // TODO: 这里需要一个额外的信息，DropTarget 的最近容器节点，用于判断目标元素是否可以被置入容器中
    const dragSourcePrototype = dragSource.prototype;

    let newNode;
    if (dragSource.id) {
      // 来自画布，完整的克隆该节点
      newNode = dragSource.getNode().cloneRawNode();
    } else {
      // 来自物料面板，创建新的初始化节点
      newNode = prototype2jsxElement(dragSource.prototype);
    }

    if (!newNode) {
      return;
    }

    const targetFile = dropTarget.node?.file;
    const sourceFile = dragSource.node?.file;

    let isValidOperation = true;
    switch (dropTarget.method) {
      // 直接往目标节点的 children 里添加一个节点
      case DropMethod.InsertChild: {
        targetFile.insertChild(dropTarget.id, newNode, 'last', dragSourcePrototype);
        break;
      }
      case DropMethod.InsertFirstChild: {
        targetFile.insertChild(dropTarget.id, newNode, 'first', dragSourcePrototype);
        break;
      }
      // 往目标节点的后边插入一个节点
      case DropMethod.InsertAfter: {
        targetFile.insertAfter(dropTarget.id, newNode, dragSourcePrototype);
        break;
      }
      // 往目标节点的前方插入一个节点
      case DropMethod.InsertBefore: {
        targetFile.insertBefore(dropTarget.id, newNode, dragSourcePrototype);
        break;
      }
      // 替换目标节点
      case DropMethod.ReplaceNode: {
        targetFile.replaceNode(dropTarget.id, newNode, dragSourcePrototype);
        break;
      }
      default:
        isValidOperation = false;
        break;
    }

    // 如果拖拽来源有 ID，表示来自画布
    const isDraggingFromView = !!dragSource.id;

    if (isValidOperation) {
      if (isDraggingFromView) {
        sourceFile.removeNode(dragSource.id);
      }

      this.selectSource.clear();
    }

    targetFile.update();
    if (isDraggingFromView && sourceFile.filename !== targetFile.filename) {
      sourceFile.update();
    }

    dragSource.clear();

    if (isValidOperation) {
      this.history.push({
        message: HistoryMessage.DropNode,
        data: {
          [targetFile.filename]: targetFile.code,
        },
      });
    }
  }

  /**
   * 刷新目标文件
   * @param filenames
   */
  refresh(filenames: string[]) {
    this.dispatchEvent(
      new CustomEvent('refresh', {
        detail: {
          filenames,
          entry: this.entry,
        },
      }),
    );
    this.onFilesChange?.(filenames);
  }

  /**
   * 基于输入结点获得结点依赖的导入声明信息
   * @param nodes
   */
  private getImportDeclarationByNodes(nodes: JSXElement[]) {
    let names = nodes.reduce((prev, cur) => {
      prev = prev.concat(getJSXElementChildrenNames(cur));
      return prev;
    }, []);
    names = uniq(names);
    const importDeclarations = namesToImportDeclarations(names, this.selectSource.file.importMap);
    return importDeclarations;
  }

  /**
   * 根据路由路径获取文件名
   * @param routePath
   * @returns
   */
  private getFilenameByRoutePath(routePath: string) {
    let filename: string;
    this.routeModule?.routes.forEach((route) => {
      if (isPathnameMatchRoute(routePath, route.path) && route.importPath) {
        const absolutePath = route.importPath.replace('.', '/src');
        filename = this.getRealViewFilePath(absolutePath);
      }
    });
    return filename;
  }

  private getRealViewFilePath(filePath: string): string {
    // 如果有后缀名直接返回
    if (hasFileExtension(filePath)) {
      return filePath;
    }

    const possiblePaths = [
      `${filePath}.js`,
      `${filePath}.jsx`,
      `${filePath}/index.js`,
      `${filePath}/index.jsx`,
    ];

    for (const filepath of possiblePaths) {
      if (this.files.has(filepath)) {
        return filepath;
      }
    }
  }

  /**
   * 文件拷贝
   * @param sourcePath
   * @param targetPath
   */
  private copyFiles(sourceFilePath: string, targetFilePath: string) {
    if (this.files.has(sourceFilePath)) {
      // 来源是文件
      const file = this.files.get(sourceFilePath);
      this.addFile(`${targetFilePath}.js`, file.cleanCode, file.type);
    } else if (this.files.has(`${sourceFilePath}/index.js`)) {
      // 来源是目录
      Array.from(this.files.keys()).forEach((key) => {
        if (key.startsWith(`${sourceFilePath}/`)) {
          const sourceFile = this.getFile(key);
          this.addFile(
            targetFilePath + key.slice(sourceFilePath.length),
            sourceFile.cleanCode,
            sourceFile.type,
          );
        }
      });
    } else {
      logger.error('copyFiles failed, source: %s, target: %s', sourceFilePath, targetFilePath);
    }
  }

  /**
   * 解析 serviceKey
   * @param serviceKey
   * @returns
   *
   * @example services.list => { moduleName: 'index', name: 'list' }
   * @example services.sub.list => { moduleName: 'sub', name: 'list' }
   * @example foo => undefined
   */
  private parseServiceKey(serviceKey: string) {
    const parts = serviceKey.split('.');
    if (parts[0] !== 'services') {
      return {};
    }

    let moduleName = 'index';
    let name = '';
    switch (parts.length) {
      case 2: {
        name = parts[1];
        break;
      }
      case 3: {
        moduleName = parts[1];
        name = parts[2];
        break;
      }
      default:
        break;
    }
    return {
      moduleName,
      name,
    };
  }
}
