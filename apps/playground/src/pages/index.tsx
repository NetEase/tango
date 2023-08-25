import React from 'react';
import {
  createEngine,
  Designer,
  DesignerPanel,
  SidebarPanel,
  SettingPanel,
  ToolbarPanel,
  WorkspacePanel,
  ViewPanel,
  CodeEditor,
  Sandbox,
  DndQuery,
  ComponentsView,
} from '@music163/tango-designer';
import { prototypes, menuData } from '@music163/antd/lib/esm/designer';
import { Logo, ProjectDetail } from './share';
import { sampleFiles } from '../mock/project';
import './index.less';

/**
 * 1. 如果要支持代码格式化，需要提前在 html 模板中引入
 * <script src="https://unpkg.com/prettier@2.6.0/standalone.js"></script>
 * <scrip src="https://unpkg.com/prettier@2.6.0/parser-graphql.js"></script>
 */

// 2. 引擎初始化
const engine = createEngine({
  entry: '/src/index.js',
  files: sampleFiles,
  componentPrototypes: prototypes,
});

const workspace = engine.workspace;

// @ts-ignore
window.__workspace__ = workspace;

const sandboxQuery = new DndQuery({
  context: 'iframe',
});

/**
 * 3. 平台初始化
 * 默认使用 CodeSandbox https://local.netease.com:6006/
 * 如果使用 ViteSandbox https://local.netease.com:6006?moduleType=esm
 */
export default function App() {
  return (
    <Designer engine={engine} sandboxQuery={sandboxQuery}>
      <DesignerPanel
        logo={<Logo />}
        description={<ProjectDetail />}
        actions={
          <ToolbarPanel>
            <ToolbarPanel.Item key="modeSwitch" placement="right" />
            <ToolbarPanel.Item key="togglePanel" placement="right" />
          </ToolbarPanel>
        }
      >
        <SidebarPanel>
          <SidebarPanel.Item key="outline" />
          <SidebarPanel.Item key="components">
            <ComponentsView menuData={menuData as any} />
          </SidebarPanel.Item>
          <SidebarPanel.Item key="model" isFloat width={800} />
          <SidebarPanel.Item key="dataSource" isFloat width={800} />
        </SidebarPanel>
        <WorkspacePanel>
          <ViewPanel mode="design">
            <Sandbox />
          </ViewPanel>
          <ViewPanel mode="code">
            <CodeEditor />
          </ViewPanel>
        </WorkspacePanel>
        <SettingPanel />
      </DesignerPanel>
    </Designer>
  );
}
