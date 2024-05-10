import React, { useState } from 'react';
import { Box, Text, styled } from 'coral-system';
import { Dropdown, DropdownProps } from 'antd';
import Draggable from 'react-draggable';
import { IconFont } from '@music163/tango-ui';
import { CloseOutlined } from '@ant-design/icons';

const CloseIcon = styled(CloseOutlined)`
  cursor: pointer;
  margin-left: 10px;
  padding: 2px;
  font-size: 13px;
  &:hover {
    color: var(--tango-colors-text1);
    background-color: var(--tango-colors-line1);
    border-radius: 4px;
  }
`;

interface DragPanelProps extends DropdownProps {
  // 标题
  title?: React.ReactNode | string;
  // 内容
  body?: React.ReactNode | string;
  // 底部
  footer?: ((close: () => void) => React.ReactNode) | React.ReactNode | string;
  // 宽度
  width?: number | string;
  // 右上角区域
  extra?: React.ReactNode | string;
}

export function DragPanel({
  title,
  footer,
  body,
  children,
  width = 330,
  extra,
  ...props
}: DragPanelProps) {
  const [open, setOpen] = useState(false);

  const footerNode = typeof footer === 'function' ? footer(() => setOpen(false)) : footer;

  return (
    <Dropdown
      open={open}
      placement="bottomCenter"
      dropdownRender={() => {
        return (
          <Draggable handle=".selection-drag-bar">
            <Box
              bg="#FFF"
              borderRadius="m"
              boxShadow="lowDown"
              border="solid"
              borderColor="line2"
              overflow="hidden"
              width={width}
            >
              {/* 头部区域 */}
              <Box
                px="l"
                py="m"
                className="selection-drag-bar"
                borderBottom="1px solid var(--tango-colors-line2)"
                cursor="move"
                display="flex"
                justifyContent="space-between"
              >
                <Box fontSize="12px" color="text2">
                  <IconFont type="icon-applications" />
                  <Text marginLeft={'5px'}>{title}</Text>
                </Box>
                <Box color="text2" fontSize="12px" display="flex" alignItems="center">
                  {extra}
                  <CloseIcon onClick={() => setOpen(false)} />
                </Box>
              </Box>
              {/* 主体区域 */}
              {body}
              {/* 底部 */}
              {footer && (
                <Box
                  px="l"
                  py="m"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  background="var(--tango-colors-line1)"
                  fontSize="12px"
                  fontWeight={400}
                  borderTop="1px solid var(--tango-colors-line2)"
                >
                  {footerNode}
                </Box>
              )}
            </Box>
          </Draggable>
        );
      }}
      {...props}
    >
      {React.cloneElement(children as any, {
        onClick: (e: Event) => {
          e.stopPropagation();
          setOpen(!open);
          (children as any).props?.onClick?.(e);
        },
      })}
    </Dropdown>
  );
}
