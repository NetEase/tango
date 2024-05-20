import { getValue, setValue } from '@music163/tango-helpers';
import {
  HistoryTool,
  ModeSwitchTool,
  PreviewTool,
  RouteSwitchTool,
  TogglePanelTool,
} from './toolbar';
import {
  ComponentsPanel,
  DataSourcePanel,
  DependencyPanel,
  OutlinePanel,
  VariablePanel,
} from './sidebar';
import {
  CopyNodeAction,
  DeleteNodeAction,
  ViewSourceAction,
  ParentNodeAction,
} from './selection-menu';

const widgets = {};

export function registerWidget(key: string, component: React.ComponentType<any>) {
  if (!/^(toolbar|sidebar|selectionMenu)\.[a-zA-z]+$/.test(key)) {
    throw new Error(
      `Invalid widget key(${key}), should start with toolbar, sidebar, or selection-menu`,
    );
  }
  setValue(widgets, key, component);
}

export function getWidget(key: string) {
  if (!key) {
    return;
  }

  return getValue(widgets, key);
}

registerWidget('toolbar.modeSwitch', ModeSwitchTool);
registerWidget('toolbar.preview', PreviewTool);
registerWidget('toolbar.history', HistoryTool);
registerWidget('toolbar.routeSwitch', RouteSwitchTool);
registerWidget('toolbar.togglePanel', TogglePanelTool);

registerWidget('sidebar.components', ComponentsPanel);
registerWidget('sidebar.outline', OutlinePanel);
registerWidget('sidebar.dependency', DependencyPanel);
registerWidget('sidebar.variables', VariablePanel);
registerWidget('sidebar.dataSource', DataSourcePanel);

registerWidget('selectionMenu.copyNode', CopyNodeAction);
registerWidget('selectionMenu.deleteNode', DeleteNodeAction);
registerWidget('selectionMenu.parentNode', ParentNodeAction);
registerWidget('selectionMenu.viewSource', ViewSourceAction);
