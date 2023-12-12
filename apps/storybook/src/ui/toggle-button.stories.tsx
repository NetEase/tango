import React from 'react';
import { ToggleButton, UndoOutlined, RedoOutlined } from '@music163/tango-ui';
import { Box, Group, Flex } from 'coral-system';

export default {
  title: 'UI/ToggleButton',
};

export function Basic() {
  return (
    <Box>
      <Box display="flex" columnGap="l" p="l">
        <ToggleButton>
          <UndoOutlined />
        </ToggleButton>
        <ToggleButton selected>
          <RedoOutlined />
        </ToggleButton>
        <ToggleButton disabled>
          <RedoOutlined />
        </ToggleButton>
      </Box>
      <Box display="flex" columnGap="l" p="l">
        <ToggleButton type="primary">
          <UndoOutlined />
        </ToggleButton>
        <ToggleButton type="primary" selected>
          <RedoOutlined />
        </ToggleButton>
        <ToggleButton type="primary" disabled>
          <RedoOutlined />
        </ToggleButton>
      </Box>
    </Box>
  );
}

export function DarkMode() {
  return (
    <Box>
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
      <Flex gap="l" bg="#222" p="l">
        <ToggleButton shape="text">
          <UndoOutlined />
        </ToggleButton>
        <ToggleButton shape="text" selected>
          <RedoOutlined />
        </ToggleButton>
        <ToggleButton shape="text" disabled>
          <RedoOutlined />
        </ToggleButton>
      </Flex>
    </Box>
  );
}

export function ButtonGroup() {
  return (
    <Group attached>
      <ToggleButton>
        <UndoOutlined />
      </ToggleButton>
      <ToggleButton selected>
        <RedoOutlined />
      </ToggleButton>
      <ToggleButton disabled>
        <RedoOutlined />
      </ToggleButton>
    </Group>
  );
}
