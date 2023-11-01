import React from 'react';
import { Box } from 'coral-system';
import { CollapsePanel } from '@music163/tango-ui';
import { StateTree } from './state-tree';
import { ComponentsTree } from './components-tree';

export interface OutlineViewProps {
  /**
   * 展示状态视图
   */
  showStateView?: boolean;
  /**
   * 是否显示切换可见状态按钮
   */
  showToggleVisibleIcon?: boolean;
}

export function OutlinePanel({
  showStateView = true,
  showToggleVisibleIcon = true,
}: OutlineViewProps) {
  return (
    <Box display="flex" height="100%" position="relative">
      <Box>
        <CollapsePanel
          title="页面结构"
          maxHeight={showStateView ? '90%' : '100%'}
          collapsed={!showStateView ? false : undefined}
          overflowY="auto"
          showBottomBorder={showStateView}
        >
          <ComponentsTree showToggleVisibleIcon={showToggleVisibleIcon} />
        </CollapsePanel>
        {showStateView && (
          <CollapsePanel title="页面状态" stickyHeader maxHeight="90%" overflowY="auto">
            <StateTree />
          </CollapsePanel>
        )}
      </Box>
    </Box>
  );
}
