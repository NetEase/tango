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
}

export function OutlinePanel({ showStateView = true }: OutlineViewProps) {
  return (
    <Box height="100%" position="relative">
      <CollapsePanel title="页面结构" stickyHeader maxHeight="90%" overflowY="auto">
        <ComponentsTree />
      </CollapsePanel>
      {showStateView && (
        <CollapsePanel title="页面状态" stickyHeader maxHeight="90%" overflowY="auto">
          <StateTree />
        </CollapsePanel>
      )}
    </Box>
  );
}
