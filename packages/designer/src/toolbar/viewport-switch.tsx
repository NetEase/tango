import React from 'react';
import { Group } from 'coral-system';
import { ToggleButton } from '@music163/tango-ui';
import { DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { observer, useDesigner } from '@music163/tango-context';

/**
 * @deprecated
 */
export const ViewportSwitchTool = observer(() => {
  const designer = useDesigner();
  return (
    <Group attached>
      <ToggleButton
        shape="ghost"
        selected={designer.simulator.name === 'desktop'}
        onClick={() => {
          designer.setSimulator('desktop');
        }}
        tip="桌面视图"
      >
        <DesktopOutlined />
      </ToggleButton>
      <ToggleButton
        shape="ghost"
        selected={designer.simulator.name === 'phone'}
        onClick={() => {
          designer.setSimulator('phone');
        }}
        tip="手机视图"
      >
        <MobileOutlined />
      </ToggleButton>
    </Group>
  );
});
