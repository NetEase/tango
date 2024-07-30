import { Box } from 'coral-system';
import { Button, Form, Input, Modal, Space } from 'antd';
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
import prototypes from '../helpers/prototypes';
import { Logo, ProjectDetail, bootHelperVariables, emptyPageCode, sampleFiles } from '../helpers';
import {
  ApiOutlined,
  AppstoreAddOutlined,
  BuildOutlined,
  FunctionOutlined,
  PlusOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';
import { Action, PackageOutlined } from '@music163/tango-ui';
import { useState } from 'react';

const menuData = {
  common: [
    {
      title: '常用',
      items: [
        'Button',
        'Section',
        'Columns',
        'Column',
        'Box',
        'Text',
        'Space',
        'Typography',
        'Title',
        'Paragraph',
        'Table',
        'Each',
      ],
    },
    {
      title: '输入',
      items: ['Input', 'InputNumber', 'Select'],
    },
    {
      title: 'Formily表单',
      items: ['FormilyForm', 'FormilyFormItem', 'FormilySubmit', 'FormilyReset'],
    },
    {
      title: '数据展示',
      items: ['Comment'],
    },
  ],
};

// 1. 实例化工作区
const workspace = new Workspace({
  entry: '/src/index.js',
  files: sampleFiles,
  prototypes,
});

// inject workspace to window for debug
(window as any).__workspace__ = workspace;

// 2. 引擎初始化
const engine = createEngine({
  workspace,
  menuData,
  defaultActiveView: 'design', // dual code design
});

// @ts-ignore
window.__workspace__ = workspace;

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
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [form] = Form.useForm();
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
              <Toolbar.Item key="routeSwitch" placement="left" activeViews={['design']} />
              <Toolbar.Item key="addPage" placement="left" activeViews={['design']}>
                <Action
                  tooltip="添加页面"
                  shape="outline"
                  icon={<PlusOutlined />}
                  onClick={() => setShowNewPageModal(true)}
                />
              </Toolbar.Item>
              <Toolbar.Item key="history" placement="left" activeViews={['design']} />
              <Toolbar.Item key="preview" placement="left" activeViews={['design']} />
              <Toolbar.Item key="togglePanel" placement="right" activeViews={['design']} />
              <Toolbar.Item key="modeSwitch" placement="right" />
              <Toolbar.Separator />
              <Toolbar.Item placement="right">
                <Space>
                  <Button type="primary">发布</Button>
                </Space>
              </Toolbar.Item>
            </Toolbar>
            <Modal
              title="添加新页面"
              open={showNewPageModal}
              onCancel={() => setShowNewPageModal(false)}
              footer={null}
            >
              <Form
                form={form}
                onFinish={(values) => {
                  workspace.addViewFile(values.name, emptyPageCode);
                  setShowNewPageModal(false);
                }}
                layout="vertical"
              >
                <Form.Item label="文件名" name="name" required rules={[{ required: true }]}>
                  <Input placeholder="请输入文件名" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </Box>
        }
      >
        <Sidebar>
          <Sidebar.Item
            key="components"
            label="组件"
            icon={<AppstoreAddOutlined />}
            widgetProps={{
              menuData,
            }}
          />
          <Sidebar.Item key="outline" label="结构" icon={<BuildOutlined />} />
          <Sidebar.Item
            key="variables"
            label="变量"
            icon={<FunctionOutlined />}
            isFloat
            width={800}
          />
          <Sidebar.Item key="dataSource" label="接口" icon={<ApiOutlined />} isFloat width={800} />
          <Sidebar.Item
            key="dependency"
            label="依赖"
            icon={<PackageOutlined />}
            isFloat
            width={800}
          />
        </Sidebar>
        <WorkspacePanel>
          <WorkspaceView mode="code">
            <CodeEditor />
          </WorkspaceView>
          <WorkspaceView mode="design">
            <Sandbox
              onMessage={(e) => {
                if (e.type === 'done') {
                  const sandboxWindow: any = sandboxQuery.window;
                  // if (sandboxWindow.TangoAntd) {
                  // if (sandboxWindow.TangoAntd.menuData) {
                  //   setMenuData(sandboxWindow.TangoAntd.menuData);
                  // }
                  // if (sandboxWindow.TangoAntd.prototypes) {
                  //   workspace.setComponentPrototypes(sandboxWindow.TangoAntd.prototypes);
                  // }
                  // }
                  if (sandboxWindow.localTangoComponentPrototypes) {
                    workspace.setComponentPrototypes(sandboxWindow.localTangoComponentPrototypes);
                  }
                }
              }}
              navigatorExtra={<Button size="small">hello world</Button>}
            />
          </WorkspaceView>
        </WorkspacePanel>
        <SettingPanel />
      </DesignerPanel>
    </Designer>
  );
}
