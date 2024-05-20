import React from 'react';
import { Box } from 'coral-system';
import { observer, useDesigner } from '@music163/tango-context';
import { DesignerViewType } from '@music163/tango-core';
import { ComponentsPopover } from './components';

export interface WorkspaceViewProps {
  /**
   * 视图面板模式，对应 Workspace 的模式
   */
  mode?: DesignerViewType;
  children: React.ReactNode;
}

export const WorkspaceView = observer((props: WorkspaceViewProps) => {
  const { mode = 'design', children } = props;
  const designer = useDesigner();
  const display = mode !== designer.activeView ? 'none' : 'block';
  // 云音乐移动端模式小屏幕适配，可能会溢出屏幕
  const overflow =
    designer.simulator.name === 'phone' ? 'auto' : designer.isPreview ? 'auto' : 'hidden';
  return (
    <Box
      className={`ViewPanel ${mode}`}
      display={designer.activeView === 'dual' ? 'block' : display}
      flex="1"
      overflow={overflow}
      position="relative"
    >
      {children}
      {/* 添加组件弹层 */}
      {display === 'block' && <ComponentsPopover type="inner" isControlled />}
    </Box>
  );
});
