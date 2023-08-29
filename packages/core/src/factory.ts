import { Designer, Engine, SimulatorNameType } from './models';
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
}

/**
 * Designer 实例化工厂函数
 * @param options
 * @returns
 */
export function createEngine({
  workspace,
  defaultSimulatorMode = 'desktop',
}: ICreateEngineOptions) {
  const engine = new Engine({
    workspace,
    designer: new Designer({
      workspace,
      simulator: defaultSimulatorMode,
    }),
  });

  return engine;
}
