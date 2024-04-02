import React from 'react';
import { Box, css, Text } from 'coral-system';
import { Button, Dropdown, Input, Menu } from 'antd';
import { DownOutlined, PlusSquareOutlined } from '@ant-design/icons';

type ActionOptionType = {
  label?: string;
  value?: string;
  [key: string]: any;
};

interface ActionSelectProps {
  /**
   * 是否支持输入
   */
  showInput?: boolean;
  /**
   * 输入框默认值
   */
  defaultInputValue?: string;
  /**
   * 输入文本时的回调
   */
  onInputChange?: (value: string) => void;
  /**
   * 提示文本
   */
  text?: string;
  /**
   * 选择菜单时的回调
   */
  onSelect?: (key: string) => void;
  /**
   * 选择的菜单列表
   */
  options?: ActionOptionType[];
}

const actionInputStyle = css`
  overflow: auto;
  font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;

  .action-input-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--tango-colors-text3);

    &:hover {
      color: var(--tango-colors-text2);
    }
  }

  .anticon-down {
    color: var(--tango-colors-text-placeholder);
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const inputStyle = { width: 'calc(100% - 82px)' };

export function ActionSelect({
  showInput = false,
  defaultInputValue,
  text,
  options = [],
  onSelect,
  onInputChange,
}: ActionSelectProps) {
  const menu = (
    <Menu onClick={({ key }) => onSelect(key)}>
      {options.map((item) => (
        <Menu.Item key={item.value}>
          <Box display="flex" alignItems="center" minWidth={200} columnGap="m">
            <Box flex="1">{item.label}</Box>
            <Text fontSize="12px" color="text.note">
              {item.value}
            </Text>
          </Box>
        </Menu.Item>
      ))}
    </Menu>
  );

  if (showInput) {
    return (
      <Input.Group compact>
        <Input
          placeholder="请输入文本"
          defaultValue={defaultInputValue}
          style={inputStyle}
          onBlur={(e) => {
            onInputChange && onInputChange(e.target.value);
          }}
          allowClear
        />
        <Dropdown overlay={menu}>
          <Button icon={<PlusSquareOutlined />}>预设</Button>
        </Dropdown>
      </Input.Group>
    );
  }

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Box
        border="solid"
        borderColor="line.normal"
        borderRadius="s"
        height="32px"
        lineHeight="32px"
        px="m"
        mb="m"
        css={actionInputStyle}
      >
        <Box className="action-input-text" color="text.body">
          {text}
        </Box>
        <DownOutlined />
      </Box>
    </Dropdown>
  );
}
