import React, { useState } from 'react';
import { Box, Text, styled } from 'coral-system';
import { Popover, PopoverProps, IconFont } from './';
import Draggable from 'react-draggable';
import { CloseOutlined } from '@ant-design/icons';
import { noop } from '@music163/tango-helpers';

// Dragging over an iframe stops dragging when moving the mouse too fast #613
// https://github.com/react-grid-layout/react-draggable/issues/613
const injectStyleToBody = () => {
  const id = 'react-draggable-transparent-selection';
  if (document.getElementById(id)) {
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.innerHTML = `
  /* Prevent iframes from stealing drag events */
  .react-draggable-transparent-selection iframe {
    pointer-events: none;
  }
  `;
  document.head.appendChild(style);
};

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

const DragPanelContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--tango-colors-line2);
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  resize: ${(props) => (props.resizeable ? 'both' : 'none')};
  overflow: ${(props) => (props.resizeable ? 'auto' : 'hidden')};
`;

const DragPanelHeader = styled(Box)`
  padding: 8px 12px;
  border-bottom: 1px solid var(--tango-colors-line2);
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 36px;
`;

const DragPanelBody = styled(Box)`
  flex: 1;
  min-height: 0;
  > * {
    height: 100%;
  }
`;

const DragPanelFooter = styled(Box)`
  padding: 8px 12px;
  min-height: 36px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--tango-colors-line1);
  font-size: 12px;
  font-weight: 400;
  border-top: 1px solid var(--tango-colors-line2);
`;

interface DragPanelProps extends Omit<PopoverProps, 'overlay' | 'open'> {
  // 标题
  title?: React.ReactNode | string;
  // 内容
  body?: React.ReactNode | string;
  // 底部
  footer?: ((close: () => void) => React.ReactNode) | React.ReactNode | string;
  // 宽度
  width?: number | string;
  // 高度
  height?: number | string;
  // 右上角区域
  extra?: React.ReactNode | string;
  // 是否可以缩放
  resizeable?: boolean;
  children?: React.ReactNode;
}

export function DragPanel({
  title,
  footer,
  body,
  children,
  width = 330,
  height = 330,
  extra,
  onOpenChange = noop,
  resizeable = false,
  ...props
}: DragPanelProps) {
  const [open, setOpen] = useState(false);

  const footerNode =
    typeof footer === 'function'
      ? footer(() => {
          setOpen(false);
          onOpenChange(false);
        })
      : footer;

  return (
    <Popover
      open={open}
      onOpenChange={(innerOpen) => {
        setOpen(innerOpen);
        onOpenChange(innerOpen);
      }}
      overlay={
        <Draggable
          handle=".drag-panel-header"
          onStart={() => {
            injectStyleToBody();
          }}
        >
          <DragPanelContainer
            className="drag-panel"
            width={width}
            height={height}
            resizeable={resizeable}
          >
            <DragPanelHeader className="drag-panel-header">
              <Box fontSize="12px" color="text2">
                <IconFont type="icon-applications" />
                <Text marginLeft={'5px'}>{title}</Text>
              </Box>
              <Box color="text2" fontSize="12px" display="flex" alignItems="center">
                {extra}
                <CloseIcon
                  onClick={() => {
                    setOpen(false);
                    onOpenChange(false);
                  }}
                />
              </Box>
            </DragPanelHeader>
            <DragPanelBody className="drag-panel-body">{body}</DragPanelBody>
            {footer && (
              <DragPanelFooter className="drag-panel-footer">{footerNode}</DragPanelFooter>
            )}
          </DragPanelContainer>
        </Draggable>
      }
      {...props}
    >
      {children}
    </Popover>
  );
}
