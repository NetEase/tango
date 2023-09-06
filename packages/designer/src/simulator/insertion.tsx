import React from 'react';
import { Box, css } from 'coral-system';
import { DropMethod } from '@music163/tango-core';
import { observer, useWorkspace } from '@music163/tango-context';

const insertionStyle = css`
  display: none;
  z-index: 1000;
  position: absolute;
  pointer-events: none;
  transition: left 0.2s ease-out, top 0.2s ease-out;
`;

/**
 * 插入提示符
 */
export const InsertionPrompt = observer(() => {
  const workspace = useWorkspace();
  const dragSource = workspace.dragSource;
  const dropTarget = dragSource.dropTarget;

  if (!dragSource.isDragging || !dropTarget.bounding) {
    // 没有拖拽，或没有着陆点的轮廓信息，不渲染
    return null;
  }

  let style: React.CSSProperties;
  const bounding = dropTarget.bounding;
  switch (dropTarget.display) {
    case 'inline':
    case 'inline-block':
    case 'inline-flex':
    case 'inline-grid': {
      if (dropTarget.method === DropMethod.InsertBefore) {
        style = {
          display: 'block',
          left: bounding.left,
          top: bounding.top,
          width: 2,
          height: bounding.height,
        };
      } else if (dropTarget.method === DropMethod.InsertAfter) {
        style = {
          display: 'block',
          left: bounding.left + bounding.width,
          top: bounding.top,
          width: 2,
          height: bounding.height,
        };
      }
      break;
    }
    default: {
      if (dropTarget.method === DropMethod.InsertBefore) {
        style = {
          display: 'block',
          left: bounding.left,
          top: bounding.top,
          width: bounding.width,
          height: 2,
        };
      } else if (dropTarget.method === DropMethod.InsertAfter) {
        style = {
          display: 'block',
          left: bounding.left,
          top: bounding.top + bounding.height,
          width: bounding.width,
          height: 2,
        };
      }
    }
  }

  return <Box className="AuxInsertion" bg="brand" style={style} css={insertionStyle} />;
});
