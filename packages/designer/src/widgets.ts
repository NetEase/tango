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
  SelectParentNodeAction,
  MoreActionsAction,
} from './selection-menu';
import {
  CopyNodeContextAction,
  DeleteNodeContextAction,
  PasteNodeContextAction,
  ViewSourceContextAction,
} from './context-menu';

const widgets = {};

export function registerWidget(key: string, component: React.ComponentType<any>) {
  if (!/^(toolbar|sidebar|selectionMenu|contextMenu)\.[a-zA-z]+$/.test(key)) {
    throw new Error(
      `Invalid widget key(${key}), should start with toolbar, sidebar, contextMenu or selectionMenu`,
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
registerWidget('selectionMenu.selectParentNode', SelectParentNodeAction);
registerWidget('selectionMenu.viewSource', ViewSourceAction);
registerWidget('selectionMenu.moreActions', MoreActionsAction);

registerWidget('contextMenu.viewSource', ViewSourceContextAction);
registerWidget('contextMenu.copyNode', CopyNodeContextAction);
registerWidget('contextMenu.pasteNode', PasteNodeContextAction);
registerWidget('contextMenu.deleteNode', DeleteNodeContextAction);
