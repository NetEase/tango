import type { Engine } from '@music163/tango-core';
import { createContext } from '@music163/tango-helpers';

interface CustomVariableData {
  key: string;
  title: string;
  children?: CustomVariableData[];
  [key: string]: any;
}

export interface ITangoEngineContext {
  /**
   * 低代码引擎
   */
  engine: Engine;
  /**
   * 自定义配置数据
   */
  config?: {
    customActionVariables?: CustomVariableData[];
    customExpressionVariables?: CustomVariableData[];
  };
}

const [TangoEngineProvider, useTangoEngine] = createContext<ITangoEngineContext>({
  name: 'TangoEngineContext',
});

export { TangoEngineProvider };

export const useWorkspace = () => {
  return useTangoEngine()?.engine.workspace;
};

export const useDesigner = () => {
  return useTangoEngine()?.engine.designer;
};

export const useWorkspaceData = () => {
  const ctx = useTangoEngine();
  const workspace = useWorkspace();
  const modelVariables: any[] = []; // 绑定变量列表
  const storeActionVariables: any[] = []; // 模型中的所有 actions
  const storeVariables: any[] = []; // 模型中的所有变量
  const serviceVariables: any[] = []; // 服务中的所有变量

  Object.values(workspace.storeModules).forEach((file) => {
    const prefix = `stores.${file.name}`;
    const states = file.states.map((item) => ({
      title: item.name,
      key: `${prefix}.${item.name}`,
      raw: item.code,
    }));
    const actions = file.actions.map((item) => ({
      title: item.name,
      key: `${prefix}.${item.name}`,
      type: 'function',
      raw: item.code,
    }));

    modelVariables.push({
      title: file.name,
      key: prefix,
      selectable: false,
      children: states,
    });

    storeActionVariables.push({
      title: file.name,
      key: prefix,
      selectable: false,
      children: actions,
    });

    storeVariables.push({
      title: file.name,
      key: prefix,
      selectable: false,
      children: [...states, ...actions],
    });
  });

  Object.values(workspace.serviceModules).forEach((file) => {
    const prefix = file.name !== 'index' ? `services.${file.name}` : 'services';
    serviceVariables.push({
      title: file.name,
      key: prefix,
      selectable: false,
      children: Object.keys(file.serviceFunctions || {}).map((key) => ({
        title: key,
        key: [prefix, key].join('.'),
        type: 'function',
      })),
    });
  });

  // 路由选项列表
  const routeOptions = workspace.pages?.map((item) => ({
    label: `${item.name}  (${item.path})`,
    value: item.path,
  }));

  let actionVariables: CustomVariableData[] = [
    buildVariableOptions('数据模型', '$stores', storeActionVariables),
    buildVariableOptions('服务函数', '$services', serviceVariables),
  ];

  if (ctx.config?.customActionVariables) {
    actionVariables = actionVariables.concat(ctx.config?.customActionVariables);
  }

  let expressionVariables: CustomVariableData[] = [
    buildVariableOptions('数据模型', '$stores', storeVariables),
    buildVariableOptions('服务函数', '$services', serviceVariables),
  ];
  if (ctx.config?.customExpressionVariables) {
    expressionVariables = expressionVariables.concat(ctx.config?.customExpressionVariables);
  }

  return {
    modelVariables: [buildVariableOptions('数据模型', 'stores', modelVariables)],
    actionVariables,
    storeVariables,
    serviceVariables,
    expressionVariables,
    routeOptions,
  };
};

function buildVariableOptions(title: string, key: string, children: any[]) {
  return {
    key,
    title,
    children,
  };
}
