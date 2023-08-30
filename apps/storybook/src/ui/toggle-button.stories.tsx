import React from 'react';
import { ToggleButton, IconFont } from '@music163/tango-ui';
import { Box, Flex } from 'coral-system';

export default {
  title: 'UI/ToggleButton',
};

export function Basic() {
  return (
    <Box>
      <Flex gap="l" bg="#efefef" p="l">
        <ToggleButton>
          <IconFont type="icon-undo" />
        </ToggleButton>
        <ToggleButton selected>
          <IconFont type="icon-redo" />
        </ToggleButton>
        <ToggleButton disabled>
          <IconFont type="icon-redo" />
        </ToggleButton>
      </Flex>
      <Flex gap="l" bg="#222" p="l">
        <ToggleButton shape="ghost">
          <IconFont type="icon-undo" />
        </ToggleButton>
        <ToggleButton shape="ghost" selected>
          <IconFont type="icon-redo" />
        </ToggleButton>
        <ToggleButton shape="ghost" disabled>
          <IconFont type="icon-undo" />
        </ToggleButton>
      </Flex>
    </Box>
  );
}
