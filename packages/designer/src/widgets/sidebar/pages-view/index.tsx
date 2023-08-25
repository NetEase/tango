import React from 'react';
import { Box } from 'coral-system';
import { CollapsePanel } from '@music163/tango-ui';
import { StateView } from './state';
import { OutlineView } from './outline';

export interface OutlineViewProps {
  /**
   * 展示状态视图
   */
  showStateView?: boolean;
}

export function PagesView({ showStateView = true }: OutlineViewProps) {
  return (
    <Box height="100%" position="relative">
      <CollapsePanel title="页面结构" stickyHeader maxHeight="90%" overflowY="auto">
        <OutlineView />
      </CollapsePanel>
      {showStateView && (
        <CollapsePanel title="页面状态" stickyHeader maxHeight="90%" overflowY="auto">
          <StateView />
        </CollapsePanel>
      )}
    </Box>
  );
}
