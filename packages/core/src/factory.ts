import { Designer, DesignerViewType, Engine, SimulatorNameType } from './models';
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
   * 默认激活的侧边栏
   */
  defaultActiveSidebarPanel?: string;

  /**
   * 默认激活的视图
   */
  defaultActiveView?: DesignerViewType;
}

/**
 * Designer 实例化工厂函数
 * @param options
 * @returns
 */
export function createEngine({
  workspace,
  defaultSimulatorMode = 'desktop',
  defaultActiveSidebarPanel = '',
  defaultActiveView = 'design',
}: ICreateEngineOptions) {
  const engine = new Engine({
    workspace,
    designer: new Designer({
      workspace,
      simulator: defaultSimulatorMode,
      activeSidebarPanel: defaultActiveSidebarPanel,
      activeView: defaultActiveView,
    }),
  });

  return engine;
}
