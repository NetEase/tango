import React from 'react';
import { ToggleButton, UndoOutlined, RedoOutlined } from '@music163/tango-ui';
import { Box, Flex } from 'coral-system';

export default {
  title: 'UI/ToggleButton',
};

export function Basic() {
  return (
    <Box>
      <Flex gap="l" bg="#efefef" p="l">
        <ToggleButton>
          <UndoOutlined />
        </ToggleButton>
        <ToggleButton selected>
          <RedoOutlined />
        </ToggleButton>
        <ToggleButton disabled>
          <RedoOutlined />
        </ToggleButton>
      </Flex>
      <Flex gap="l" bg="#222" p="l">
        <ToggleButton shape="ghost">
          <UndoOutlined />
        </ToggleButton>
        <ToggleButton shape="ghost" selected>
          <RedoOutlined />
        </ToggleButton>
        <ToggleButton shape="ghost" disabled>
          <UndoOutlined />
        </ToggleButton>
      </Flex>
    </Box>
  );
}
