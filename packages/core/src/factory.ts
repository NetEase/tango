import { MenuDataType } from '@music163/tango-helpers';
import { Designer, DesignerViewType, Engine, SimulatorNameType } from './models';
import { IWorkspace } from './models/interfaces';
import { EditorState } from './models/editor-state';

interface ICreateEngineOptions {
  /**
   * 自定义工作区
   */
  workspace?: IWorkspace;
  /**
   * 菜单信息
   */
  menuData?: MenuDataType;
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
  defaultActiveView = 'design',
  defaultSimulatorMode = 'desktop',
  defaultActiveSidebarPanel = '',
  menuData,
}: ICreateEngineOptions) {
  const engine = new Engine({
    workspace,
    designer: new Designer({
      workspace,
      simulator: defaultSimulatorMode,
      activeView: defaultActiveView,
      activeSidebarPanel: defaultActiveSidebarPanel,
      menuData,
    }),
  });

  return engine;
}
