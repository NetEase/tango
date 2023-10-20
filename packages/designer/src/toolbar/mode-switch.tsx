import React from 'react';
import { Group } from 'coral-system';
import { ToggleButton } from '@music163/tango-ui';
import { observer, useDesigner } from '@music163/tango-context';

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
        tip="设计视图"
      >
        设计
      </ToggleButton>
      <ToggleButton
        shape="ghost"
        selected={designer.activeView === 'code'}
        onClick={() => {
          designer.setActiveView('code'); // 切换到源码视图
          designer.setActiveSidebarPanel(''); // 关闭左侧面板
        }}
        tip="源码视图"
      >
        源码
      </ToggleButton>
    </Group>
  );
});
