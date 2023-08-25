import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Box, HTMLCoralProps, css } from 'coral-system';
import { Resizable } from 'react-resizable';

const resizeHandleStyle = css`
  position: absolute;
  top: 0;
  z-index: 999;
  width: 4px;
  height: 100%;
  cursor: col-resize;

  &:hover,
  &:active {
    background-color: var(--tango-colors-brand);
  }
`;

export interface ResizableBoxProps extends HTMLCoralProps<'div'> {
  width?: number;
  height?: number;
  resizeHandlePosition?: 'left' | 'right';
}

export function ResizableBox({
  resizeHandlePosition = 'right',
  width: widthProp,
  height,
  children,
  className,
  style,
}: ResizableBoxProps) {
  const [width, setWidth] = useState(widthProp);
  const barStyle = resizeHandlePosition === 'right' ? { right: '-4px' } : { left: '-4px' };
  return (
    <Resizable
      axis="x"
      width={width}
      height={height}
      onResize={(e, { size }) => {
        setWidth(size.width);
      }}
      onResizeStart={() => {
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
      }}
      onResizeStop={() => {
        document.body.style.pointerEvents = 'auto';
        document.body.style.userSelect = 'auto';
      }}
      handle={<Box className="ResizeHandle" css={resizeHandleStyle} {...barStyle} />}
    >
      <div
        className={cx('ResizableBox', className)}
        style={{
          position: 'relative',
          width,
          height,
          ...style,
        }}
      >
        {children}
      </div>
    </Resizable>
  );
}
