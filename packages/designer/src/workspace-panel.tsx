import React from 'react';
import { Box } from 'coral-system';
import { ReactComponentProps } from '@music163/tango-helpers';

export type WorkspacePanelProps = ReactComponentProps;

export function WorkspacePanel({ children }: WorkspacePanelProps) {
  return (
    <Box
      flex="1"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      bg="colors.custom.viewportBg"
      position="relative"
      className="WorkspacePanel"
    >
      {children}
    </Box>
  );
}
