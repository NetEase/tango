import React from 'react';
import { Box, HTMLCoralProps } from 'coral-system';

type DragBoxProps = {
  index?: number;
  onMove?: Function;
} & HTMLCoralProps<'div'>;

export const DragBox = ({ children, index, onMove, ...rest }: DragBoxProps) => {
  const handleStartDrag = (ev: React.DragEvent) => {
    ev.dataTransfer.setData('text', `${index}`);
  };

  const handleEndDrag = (ev: React.DragEvent) => {
    ev.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (ev: React.DragEvent) => {
    const idx = ev.dataTransfer.getData('text');

    onMove?.(+idx, index);
  };

  const handleDragOver = (ev: React.DragEvent) => {
    // 阻止默认行为，触发 onDrop
    ev.preventDefault();
    // TODO: 优化动画交互
  };

  return (
    <Box
      {...rest}
      draggable
      onDragStart={handleStartDrag}
      onDragEnd={handleEndDrag}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </Box>
  );
};
