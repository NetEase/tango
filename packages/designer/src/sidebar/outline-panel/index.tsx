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
  /**
   * 页面结构组件面板extra
   */
  pagesCollapsePanelExtra?: React.ReactNode;
  /**
   * 右侧额外panel区域内容
   */
  extraPanelContent?: React.ReactNode;
}

export function OutlinePanel({
  showStateView = true,
  showToggleVisibleIcon = true,
  extraPanelContent,
  pagesCollapsePanelExtra,
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
          extra={pagesCollapsePanelExtra}
        >
          <ComponentsTree showToggleVisibleIcon={showToggleVisibleIcon} />
        </CollapsePanel>
        {showStateView && (
          <CollapsePanel title="页面状态" stickyHeader maxHeight="90%" overflowY="auto">
            <StateTree />
          </CollapsePanel>
        )}
      </Box>
      {extraPanelContent && (
        <Box height={'100%'} overflowY="auto" flex={1}>
          {extraPanelContent}
        </Box>
      )}
    </Box>
  );
}
