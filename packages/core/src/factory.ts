import { ComponentPrototypeType } from '@music163/tango-helpers';
import { Designer, Engine, SimulatorNameType, Workspace } from './models';
import { FileItemType } from './types';
import { IWorkspace } from './models/interfaces';

/**
 * 这里提前实例化 workspace，先保证全局唯一
 * TIP: builtinWorkspace 暂时只是给老版的 sandbox 消费，其他场景不需要
 */
export const builtinWorkspace = new Workspace();

type CreateEngineOptionsType = {
  /**
   * 自定义工作区
   */
  workspace?: IWorkspace;
  /**
   * 是否使用老版全局 workspace，目前仅 LegacySandbox 需要开启
   */
  useBuiltinWorkspace?: boolean;
  /**
   * 文件入口
   */
  entry?: string;
  /**
   * 初始化的文件列表
   */
  files?: FileItemType[];
  /**
   * 组件的原型信息
   */
  componentPrototypes?: Record<string, ComponentPrototypeType>;
  /**
   * 默认的模拟器模式
   */
  defaultSimulatorMode?: SimulatorNameType;
};

/**
 * Designer 实例化工厂函数
 * @param options
 * @returns
 */
export function createEngine({
  workspace: workspaceProp,
  useBuiltinWorkspace,
  defaultSimulatorMode,
  files,
  entry,
  componentPrototypes,
}: CreateEngineOptionsType) {
  let workspace: IWorkspace = workspaceProp;

  if (!workspace) {
    // 如果用户没有提供，则使用内置的初始化策略
    if (useBuiltinWorkspace) {
      workspace = builtinWorkspace;
      workspace.entry = entry;
      if (files && files.length) {
        workspace.addFiles(files);
      }
      if (componentPrototypes) {
        workspace.setComponentPrototypes(componentPrototypes);
      }
    } else {
      workspace = new Workspace({
        entry,
        files,
        prototypes: componentPrototypes,
      });
    }
  }

  const engine = new Engine({
    workspace: workspaceProp || (workspace as any),
    designer: new Designer({
      workspace,
      simulator: defaultSimulatorMode,
    }),
  });

  return engine;
}
