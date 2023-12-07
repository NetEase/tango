import React from 'react';
import { observer, useDesigner } from '@music163/tango-context';
import { Box } from 'coral-system';
import {
  OpenPanelFilledLeftOutlined,
  OpenPanelFilledRightOutlined,
  OpenPanelLeftOutlined,
  OpenPanelRightOutlined,
  ToggleButton,
} from '@music163/tango-ui';

export const TogglePanelTool = observer(() => {
  const designer = useDesigner();
  return (
    <Box display="flex" columnGap="m">
      <ToggleButton
        tooltip="隐藏/显示左侧面板"
        shape="ghost"
        onClick={() => {
          designer.setActiveSidebarPanel(designer.activeSidebarPanel ? '' : 'outline');
        }}
      >
        {designer.activeSidebarPanel ? <OpenPanelFilledLeftOutlined /> : <OpenPanelLeftOutlined />}
      </ToggleButton>
      <ToggleButton
        tooltip="隐藏/显示右侧面板"
        shape="ghost"
        onClick={() => designer.toggleRightPanel()}
      >
        {designer.showRightPanel ? <OpenPanelFilledRightOutlined /> : <OpenPanelRightOutlined />}
      </ToggleButton>
    </Box>
  );
});
