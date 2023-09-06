import React from 'react';
import { observer, useDesigner } from '@music163/tango-context';
import { Box } from 'coral-system';
import { IconFont, ToggleButton } from '@music163/tango-ui';

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
        <IconFont
          type={
            designer.activeSidebarPanel ? 'icon-open-panel-filled-left' : 'icon-open-panel-left'
          }
        />
      </ToggleButton>
      <ToggleButton
        tooltip="隐藏/显示右侧面板"
        shape="ghost"
        onClick={() => designer.toggleRightPanel()}
      >
        <IconFont
          type={designer.showRightPanel ? 'icon-open-panel-filled-right' : 'icon-open-panel-right'}
        />
      </ToggleButton>
    </Box>
  );
});
