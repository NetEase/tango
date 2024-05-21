import React from 'react';
import { Menu, Space } from 'antd';
import { Box, css } from 'coral-system';

const contextActionStyle = css`
  display: flex;
  gap: 8px;
  align-items: center;

  .ContextActionContent {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ContextActionExtra {
    flex: none;
    color: var(--tango-colors-gray-40);
  }
`;

interface ContextActionProps {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  hotkey?: React.ReactNode;
  extra?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  key?: string;
}

export function ContextAction({
  icon,
  children,
  hotkey,
  extra,
  disabled,
  onClick,
  className,
  key,
}: ContextActionProps) {
  return (
    <Menu.Item key={key} onClick={onClick} icon={icon} className={className} disabled={disabled}>
      <Box className="ContextAction" css={contextActionStyle}>
        <Box className="ContextActionContent">{children}</Box>
        <Box className="ContextActionExtra">
          <Space>
            {hotkey}
            {extra}
          </Space>
        </Box>
      </Box>
    </Menu.Item>
  );
}
