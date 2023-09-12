import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import { Box, HTMLCoralProps } from 'coral-system';
import { useDesigner, useWorkspace } from '@music163/tango-context';
import { Ghost } from './ghost';
import { useSandboxQuery } from '../context';
import { SelectionTools, SelectionToolsProps } from './selection';
import { InsertionPrompt } from './insertion';
import { DraggingMask } from './mask';

export interface ViewportProps extends HTMLCoralProps<'div'> {
  selectionTools?: SelectionToolsProps['actions'];
  builtinActionMap?: SelectionToolsProps['builtinActionMap'];
}

export function Viewport({
  selectionTools,
  builtinActionMap,
  children,
  className,
  ...rest
}: ViewportProps) {
  return (
    <Box position="relative" height="100%" className={cx('Viewport', className)} {...rest}>
      <ViewportBody>{children}</ViewportBody>
      <div className="AuxTools">
        <SelectionTools actions={selectionTools} builtinActionMap={builtinActionMap} />
        <InsertionPrompt />
        <DraggingMask />
      </div>
      <Ghost />
    </Box>
  );
}

function ViewportBody({ children, ...rest }: HTMLCoralProps<'div'>) {
  const mainRef = useRef<HTMLDivElement>();
  const workspace = useWorkspace();
  const designer = useDesigner();
  const sandboxQuery = useSandboxQuery();

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (mainRef.current) {
        designer.setViewport({
          width: mainRef.current.offsetWidth,
          height: mainRef.current.offsetHeight,
        });
      }
      if (entries.length && workspace.selectSource.isSelected) {
        const items = workspace.selectSource.selected.map((item) => {
          const element = sandboxQuery.getElementBySlotId(item.id);
          if (element) {
            const bounding = sandboxQuery.getElementBounding(element);
            item.bounding = bounding;
            item.element = element;
          }
          return item;
        });
        workspace.selectSource.select(items);
      }
    });
    resizeObserver.observe(mainRef.current);
  }, []);

  return (
    <Box ref={mainRef} position="relative" height="100%" className="ViewportBody" {...rest}>
      {children}
    </Box>
  );
}
