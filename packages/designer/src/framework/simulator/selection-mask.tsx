import React from 'react';
import { Box } from 'coral-system';
import { observer, useWorkspace } from '@music163/tango-context';

export const SelectionMask = observer(() => {
  const {selectSource} = useWorkspace();
  const display = selectSource.start?.point.x && selectSource.start?.point.y ? 'block' : 'none';
  return (
    <Box
      className="SelectionMask"
      display={display}
      position="absolute"
      bg="brand"
      opacity={0.2}
     />
  );
});
