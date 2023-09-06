import { createContext, TangoRemoteServicesType } from '@music163/tango-helpers';
import type { DndQuery } from './dnd';

/**
 * TODO: 是不是直接合并到 Context 中
 */
export interface IDesignerContext {
  /**
   * 沙箱查询实例
   */
  sandboxQuery: DndQuery;
  /**
   * 远程服务
   */
  remoteServices?: TangoRemoteServicesType;
}

const [DesignerProvider, useDesigner] = createContext<IDesignerContext>({
  name: 'DesignerContext',
});

export { DesignerProvider };

export const useSandboxQuery = () => {
  return useDesigner()?.sandboxQuery;
};

export const useRemoteServices = () => {
  return useDesigner()?.remoteServices;
};
