import type { Engine } from '@music163/tango-core';
import { IVariableTreeNode, createContext } from '@music163/tango-helpers';

export interface ITangoEngineContext {
  /**
   * 低代码引擎
   */
  engine: Engine;
  /**
   * 自定义配置数据
   */
  config?: {
    customActionVariables?: IVariableTreeNode[];
    customExpressionVariables?: IVariableTreeNode[];
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

export const useEditorState = () => {
  return useTangoEngine()?.engine.editor;
};

export const useWorkspaceData = () => {
  const ctx = useTangoEngine();
  const workspace = useWorkspace();
  const modelVariables: IVariableTreeNode[] = []; // 绑定变量列表
  const storeActionVariables: IVariableTreeNode[] = []; // 模型中的所有 actions
  const storeVariables: IVariableTreeNode[] = []; // 模型中的所有变量
  const pageStoreVariables: IVariableTreeNode[] = []; // 页面中的组件实例变量
  const serviceVariables: IVariableTreeNode[] = []; // 服务中的所有变量

  pageStoreVariables.push({
    title: 'pageStore',
    key: 'pageStore',
  });

  Object.values(workspace.storeModules).forEach((file) => {
    const prefix = `stores.${file.name}`;
    const states: IVariableTreeNode[] = file.states.map((item) => ({
      title: item.name,
      key: `${prefix}.${item.name}`,
      raw: item.code,
      showRemoveButton: true,
    }));
    const actions: IVariableTreeNode[] = file.actions.map((item) => ({
      title: item.name,
      key: `${prefix}.${item.name}`,
      type: 'function',
      raw: item.code,
      showRemoveButton: true,
    }));

    modelVariables.push({
      title: file.name,
      key: prefix,
      selectable: false,
      children: states,
      showAddButton: true,
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
      showAddButton: true,
    });
  });

  Object.values(workspace.serviceModules).forEach((file) => {
    const prefix = file.name !== 'index' ? `services.${file.name}` : 'services';
    serviceVariables.push({
      title: file.name,
      key: prefix,
      selectable: false,
      showAddButton: true,
      children: Object.keys(file.serviceFunctions || {}).map((key) => ({
        title: key,
        key: [prefix, key].join('.'),
        type: 'function',
        showRemoveButton: true,
      })),
    });
  });

  // 路由选项列表
  const routeOptions = workspace.pages?.map((item) => ({
    label: `${item.name}  (${item.path})`,
    value: item.path,
  }));

  let actionVariables: IVariableTreeNode[] = [
    buildVariableOptions('数据模型', '$stores', storeActionVariables),
    buildVariableOptions('服务函数', '$services', serviceVariables),
  ];

  if (ctx.config?.customActionVariables) {
    actionVariables = actionVariables.concat(ctx.config?.customActionVariables);
  }

  let expressionVariables: IVariableTreeNode[] = [
    buildVariableOptions('当前页面组件实例', '$pageStore', pageStoreVariables),
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

function buildVariableOptions(title: string, key: string, children: IVariableTreeNode[]) {
  return {
    key,
    title,
    children,
  };
}
