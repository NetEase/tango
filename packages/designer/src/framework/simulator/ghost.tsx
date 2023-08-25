import React from 'react';
import styled from 'styled-components';
import { observer, useWorkspace } from '@music163/tango-context';
import { DRAG_GHOST_ID } from '../../helpers';

const GhostWrapper = styled.div`
  display: inline-block;
  position: absolute;
  top: -50%;
  left: -50%;
  z-index: -1;
  background-color: rgba(30, 167, 253, 0.5);
  color: #fff;
  font-size: 12px;
  line-height: 2;
  padding: 0 12px;
  pointer-events: none;
  white-space: nowrap;
`;

export const Ghost = observer(() => {
  const workspace = useWorkspace();
  const text = workspace.dragSource.name || '';
  return <GhostWrapper id={DRAG_GHOST_ID}>{text}</GhostWrapper>;
});
