import React, { useMemo } from 'react';
import { Menu, Space } from 'antd';
import { Box, css } from 'coral-system';
import { Dict, isApplePlatform } from '@music163/tango-helpers';

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
  hotkey?: string;
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
  const normalizedHotKey = useMemo(() => {
    if (!hotkey) {
      return null;
    }
    const keyMap: Dict = isApplePlatform()
      ? {
          command: '⌘',
          meta: '⌘',
          ctrl: '^',
          control: '^',
          alt: '⌥',
          option: '⌥',
          shift: '⇧',
          '+': '',
        }
      : {
          command: 'Ctrl',
          meta: 'Win',
          ctrl: 'Ctrl',
          control: 'Ctrl',
          alt: 'Alt',
          option: 'Alt',
          shift: 'Shift',
        };
    const regexp = new RegExp(Object.keys(keyMap).join('|').replace(/\+/, '\\+'), 'ig');
    return hotkey.replace(regexp, (match) => keyMap[match.toLowerCase()]);
  }, [hotkey]);

  return (
    <Menu.Item key={key} onClick={onClick} icon={icon} className={className} disabled={disabled}>
      <Box className="ContextAction" css={contextActionStyle}>
        <Box className="ContextActionContent">{children}</Box>
        <Box className="ContextActionExtra">
          <Space>
            {normalizedHotKey}
            {extra}
          </Space>
        </Box>
      </Box>
    </Menu.Item>
  );
}
