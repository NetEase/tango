import React, { useCallback } from 'react';
import { Group } from 'coral-system';
import { Modal } from 'antd';
import { ToggleButton, CodeOutlined, DualOutlined } from '@music163/tango-ui';
import { observer, useDesigner, useEditorState, useWorkspace } from '@music163/tango-context';
import { BorderOutlined } from '@ant-design/icons';

export const ModeSwitchTool = observer(() => {
  const workspace = useWorkspace();
  const designer = useDesigner();
  const editorState = useEditorState();

  const activeFileCheck = useCallback(() => {
    if (editorState.activeFile !== workspace.activeViewFile) {
      Modal.confirm({
        title: '是否切换到当前视图对应的代码文件？',
        onOk: () => {
          editorState.setActiveFile(workspace.activeViewFile);
        },
      });
    }
  }, [workspace, editorState]);

  return (
    <Group attached>
      <ToggleButton
        shape="ghost"
        selected={designer.activeView === 'design'}
        onClick={() => {
          designer.setActiveView('design');
        }}
        tooltip="设计视图"
      >
        <BorderOutlined />
      </ToggleButton>
      <ToggleButton
        shape="ghost"
        selected={designer.activeView === 'code'}
        onClick={() => {
          designer.setActiveView('code'); // 切换到源码视图
          designer.setActiveSidebarPanel(''); // 关闭左侧面板
          activeFileCheck();
        }}
        tooltip="源码视图"
      >
        <CodeOutlined />
      </ToggleButton>
      <ToggleButton
        shape="ghost"
        selected={designer.activeView === 'dual'}
        onClick={() => {
          designer.setActiveView('dual'); // 切换到双屏视图
          designer.setActiveSidebarPanel(''); // 关闭左侧面板
          activeFileCheck();
        }}
        tooltip="双屏视图"
      >
        <DualOutlined />
      </ToggleButton>
    </Group>
  );
});
