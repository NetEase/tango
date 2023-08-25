import React from 'react';
import { IconFont, ToggleButton } from '@music163/tango-ui';
import { useSandboxQuery } from '../../context';

/**
 * @deprecated
 */
export const ViewportRefreshTool = () => {
  const sandbox = useSandboxQuery();
  return (
    <ToggleButton
      tip="刷新"
      shape="ghost"
      onClick={() => {
        sandbox.reload();
      }}
    >
      <IconFont type="icon-refresh" />
    </ToggleButton>
  );
};
