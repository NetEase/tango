import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Box, HTMLCoralProps, css } from 'coral-system';
import { Resizable, ResizeHandle } from 'react-resizable';

export interface ResizableBoxProps {
  width?: number;
  height?: number;
  resizeHandlePosition?: 'left' | 'right' | 'top' | 'bottom';
  axis?: 'x' | 'y';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const resizeHandleStyle = (axis: ResizableBoxProps['axis'], barStyle: HTMLCoralProps<'div'>) => css`
  position: absolute;
  z-index: 999;
  cursor: ${axis === 'x' ? 'col-resize' : 'row-resize'};
  ${barStyle &&
  Object.keys(barStyle)
    .map((key) => `${key}: ${barStyle[key]};`)
    .join('')}
  &:hover,
  &:active {
    background-color: var(--tango-colors-brand);
  }
`;

const getResizeHandles = (
  resizeHandlePosition: ResizableBoxProps['resizeHandlePosition'],
  axis: ResizableBoxProps['axis'],
) => {
  const handles: ResizeHandle[] = [];
  switch (axis) {
    case 'x':
      handles.push(resizeHandlePosition === 'right' ? 'e' : 'w');
      break;
    case 'y':
      handles.push(resizeHandlePosition === 'bottom' ? 's' : 'n');
      break;
    default:
      break;
  }
  return handles;
};

export function ResizableBox({
  resizeHandlePosition = 'right',
  width: widthProp,
  height: heightProp,
  children,
  className,
  style,
  axis = 'x',
}: ResizableBoxProps) {
  const [width, setWidth] = useState(widthProp);
  const [height, setHeight] = useState(heightProp);

  const barStyle: HTMLCoralProps<'div'> = {
    ...(axis === 'x'
      ? {
          height: '100%',
          width: '4px',
          top: '0',
          [resizeHandlePosition === 'right' ? 'right' : 'left']: '-4px',
        }
      : {
          height: '4px',
          width: '100%',
          left: '0',
          [resizeHandlePosition === 'bottom' ? 'bottom' : 'top']: '0',
        }),
  };

  useEffect(() => {
    setWidth(widthProp);
  }, [widthProp]);

  useEffect(() => {
    setHeight(heightProp);
  }, [heightProp]);

  return (
    <Resizable
      axis={axis}
      width={width}
      resizeHandles={getResizeHandles(resizeHandlePosition, axis)}
      height={height}
      minConstraints={[150, 150]}
      maxConstraints={[window.innerWidth * 0.6, window.innerHeight * 0.8]}
      onResize={(e, { size }) => {
        if (axis === 'x') {
          setWidth(size.width);
        }
        if (axis === 'y') {
          setHeight(size.height);
        }
      }}
      onResizeStart={() => {
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
      }}
      onResizeStop={() => {
        document.body.style.pointerEvents = 'auto';
        document.body.style.userSelect = 'auto';
      }}
      handle={<Box className="ResizeHandle" css={resizeHandleStyle(axis, barStyle)} />}
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
