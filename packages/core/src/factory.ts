import { Designer, DesignerAddComponentType, Engine, SimulatorNameType } from './models';
import { IWorkspace } from './models/interfaces';

interface ICreateEngineOptions {
  /**
   * 自定义工作区
   */
  workspace?: IWorkspace;
  /**
   * 默认的模拟器模式
   */
  defaultSimulatorMode?: SimulatorNameType;
  /**
   * 默认的组件添加方式
   */
  defaultAddComponentType?: DesignerAddComponentType;
  /**
   * 默认激活的侧边栏
   */
  defaultActiveSidebarPanel?: string;
}

/**
 * Designer 实例化工厂函数
 * @param options
 * @returns
 */
export function createEngine({
  workspace,
  defaultSimulatorMode = 'desktop',
  defaultAddComponentType = 'drag',
  defaultActiveSidebarPanel = '',
}: ICreateEngineOptions) {
  const engine = new Engine({
    workspace,
    designer: new Designer({
      workspace,
      simulator: defaultSimulatorMode,
      addComponentType: defaultAddComponentType,
      activeSidebarPanel: defaultActiveSidebarPanel,
    }),
  });

  return engine;
}
