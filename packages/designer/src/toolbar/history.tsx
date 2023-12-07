import React from 'react';
import { Box } from 'coral-system';
import { ToggleButton, RedoOutlined, UndoOutlined } from '@music163/tango-ui';
import { observer, useWorkspace } from '@music163/tango-context';

export const HistoryTool = observer(() => {
  const workspace = useWorkspace();
  return (
    <Box display="flex" columnGap="m">
      <ToggleButton
        shape="ghost"
        disabled={!workspace.history.couldBack || workspace.history.index === 0}
        tooltip="撤销"
        onClick={() => {
          workspace.history.back();
          workspace.selectSource.clear();
        }}
      >
        <UndoOutlined />
      </ToggleButton>
      <ToggleButton
        shape="ghost"
        disabled={!workspace.history.couldForward}
        tooltip="重做"
        onClick={() => {
          workspace.history.forward();
          workspace.selectSource.clear();
        }}
      >
        <RedoOutlined />
      </ToggleButton>
    </Box>
  );
});
