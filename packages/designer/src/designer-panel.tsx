import React from 'react';
import { Box } from 'coral-system';
import { ReactComponentProps } from '@music163/tango-helpers';

export interface DesignerPanelProps extends ReactComponentProps {
  /**
   * 品牌图标
   */
  logo?: React.ReactNode;
  /**
   * 项目描述
   */
  description?: React.ReactNode;
  /**
   * 主行动点
   */
  actions?: React.ReactNode;
  /**
   * 自定义头部节点
   */
  header?: React.ReactNode;
}

/**
 * 设计器面板
 */
export function DesignerPanel(props: DesignerPanelProps) {
  const { header, logo, description, actions, children } = props;
  return (
    <Box height="100vh" overflow="hidden" className="DesignerPanel">
      {header ?? (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          height="48px"
          bg="colors.custom.topNavBg"
          color="colors.custom.topNavColor"
          borderBottom="solid"
          borderColor="colors.custom.topNavBorderColor"
          className="DesignerPanelHeader"
        >
          <Box display="flex" alignItems="center">
            {logo}
            {description}
          </Box>
          <Box flex="1">{actions}</Box>
        </Box>
      )}
      <Box
        display="flex"
        height="calc(100vh - 48px)"
        overflow="hidden"
        className="DesignerPanelBody"
      >
        {children}
      </Box>
    </Box>
  );
}
