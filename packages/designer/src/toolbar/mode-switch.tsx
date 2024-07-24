import React from 'react';
import { Group } from 'coral-system';
import { ToggleButton, CodeOutlined, DualOutlined } from '@music163/tango-ui';
import { observer, useDesigner } from '@music163/tango-context';
import { BorderOutlined } from '@ant-design/icons';

export const ModeSwitchTool = observer(() => {
  const designer = useDesigner();
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
        }}
        tooltip="双屏视图"
      >
        <DualOutlined />
      </ToggleButton>
    </Group>
  );
});
