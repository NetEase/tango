import React, { useState } from 'react';
import { Box } from 'coral-system';
import { Button, Space } from 'antd';
import {
  Designer,
  DesignerPanel,
  SettingPanel,
  Sidebar,
  Toolbar,
  WorkspacePanel,
  WorkspaceView,
  CodeEditor,
  Sandbox,
  DndQuery,
  themeLight,
} from '@music163/tango-designer';
import { createEngine, Workspace } from '@music163/tango-core';
import { Logo, ProjectDetail, bootHelperVariables } from '@/helpers';
import {
  AppstoreAddOutlined,
  BuildOutlined,
  ClusterOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';
import { mailFiles } from '@/helpers/mail-files';

// 1. 实例化工作区
const workspace = new Workspace({
  entry: '/src/index.js',
  files: mailFiles,
});

// 2. 引擎初始化
const engine = createEngine({
  workspace,
});

// @ts-ignore
window.__mailWorkspace__ = workspace;

// 3. 沙箱初始化
const sandboxQuery = new DndQuery({
  context: 'iframe',
});

// 4. 图标库初始化（物料面板和组件树使用了 iconfont 里的图标）
createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_2891794_151xsllxqd7.js',
});

/**
 * 5. 平台初始化，访问 https://local.netease.com:6006/
 */
export default function App() {
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuData, setMenuData] = useState(false);
  return (
    <Designer
      theme={themeLight}
      engine={engine}
      config={{
        customActionVariables: bootHelperVariables,
        customExpressionVariables: bootHelperVariables,
      }}
      sandboxQuery={sandboxQuery}
    >
      <DesignerPanel
        logo={<Logo />}
        description={<ProjectDetail />}
        actions={
          <Box px="l">
            <Toolbar>
              <Toolbar.Item key="history" placement="left" />
              <Toolbar.Item key="preview" placement="left" />
              <Toolbar.Item key="modeSwitch" placement="right" />
              <Toolbar.Item key="togglePanel" placement="right" />
              <Toolbar.Separator />
              <Toolbar.Item placement="right">
                <Space>
                  <Button type="primary">发布</Button>
                </Space>
              </Toolbar.Item>
            </Toolbar>
          </Box>
        }
      >
        <Sidebar>
          <Sidebar.Item
            key="components"
            label="组件"
            icon={<AppstoreAddOutlined />}
            widgetProps={{
              menuData: menuData as any,
              loading: menuLoading,
            }}
          />
          <Sidebar.Item key="outline" label="结构" icon={<BuildOutlined />} />
          <Sidebar.Item
            key="dependency"
            label="依赖"
            icon={<ClusterOutlined />}
            isFloat
            width={800}
          />
        </Sidebar>
        <WorkspacePanel>
          <WorkspaceView mode="design">
            <Sandbox
              onMessage={(e) => {
                if (e.type === 'done') {
                  const sandboxWindow: any = sandboxQuery.window;
                  if (sandboxWindow.TangoMail) {
                    if (sandboxWindow.TangoMail.menuData) {
                      setMenuData(sandboxWindow.TangoMail.menuData);
                      engine.designer.setMenuData(sandboxWindow.TangoMail.menuData);
                    }
                    if (sandboxWindow.TangoMail.prototypes) {
                      workspace.setComponentPrototypes(sandboxWindow.TangoMail.prototypes);
                    }
                  }
                  setMenuLoading(false);
                }
              }}
              navigatorExtra={<Button size="small">hello world</Button>}
            />
          </WorkspaceView>
          <WorkspaceView mode="code">
            <CodeEditor />
          </WorkspaceView>
        </WorkspacePanel>
        <SettingPanel />
      </DesignerPanel>
    </Designer>
  );
}
