import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { DropMethod } from '@music163/tango-core';
import { ElementBoundingType } from '@music163/tango-helpers';
import { observer, useWorkspace } from '@music163/tango-context';

const MaskWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;

  &.dragging {
    background-color: rgba(23, 97, 144, 0.26);
  }

  &.dropping {
    background-color: rgba(38, 169, 252, 0.34);
  }
`;

interface MaskProps {
  dragging?: boolean;
  dropping?: boolean;
  bounding?: ElementBoundingType;
}

const Mask = observer(({ dragging, dropping, bounding }: MaskProps) => {
  if (!bounding) {
    return null;
  }

  const clazz = cx({
    dragging,
    dropping,
  });

  const style = {
    width: bounding.width,
    height: bounding.height,
    transform: `translate(${bounding.left}px, ${bounding.top}px)`,
  };

  return <MaskWrapper className={clazz} style={style} />;
});

const showDroppingMaskMethods = [DropMethod.InsertChild, DropMethod.ReplaceNode];

/**
 * 拖拽遮罩提示
 */
export const DraggingMask = observer(() => {
  const workspace = useWorkspace();
  const dragSource = workspace.dragSource;
  const dropTarget = dragSource.dropTarget;

  const dragging = !!dragSource.id;
  const dropping = !!(
    dragSource.isDragging &&
    showDroppingMaskMethods.includes(dropTarget.method) &&
    dropTarget.bounding
  );

  return (
    <React.Fragment>
      <Mask dragging={dragging} bounding={dragSource.bounding} />
      <Mask dropping={dropping} bounding={dropTarget.bounding} />
    </React.Fragment>
  );
});
