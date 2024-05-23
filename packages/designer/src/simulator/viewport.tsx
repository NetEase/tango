import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import { Box, HTMLCoralProps } from 'coral-system';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import { Ghost } from './ghost';
import { useSandboxQuery } from '../context';
import { SelectionTools, SelectionToolsProps } from './selection';
import { InsertionPrompt } from './insertion';
import { DraggingMask } from './mask';
import { Dropdown, DropdownProps } from 'antd';
import { ContextMenu } from '../components';

export interface ViewportProps extends HTMLCoralProps<'div'> {
  selectionTools?: SelectionToolsProps['actions'];
}

const ViewportContextMenu = observer((props: DropdownProps) => {
  const designer = useDesigner();

  // FIXME: 考虑优化定位实现？
  // 由于 iframe 内的 contextmenu 事件无法被外层感知到，所以无法自动展示与定位
  // 而手动指定 align 会干扰 contextmenu 溢出时的位置处理，会定位到完全相反的位置
  // 因此，给 dropdown 单独提供一个定位容器，将其定位至 iframe 内触发点击的位置
  // 并在每次 contextmenu 隐藏时销毁 dropdown，让 dropdown 能重新获取新的位置
  return (
    designer.showContextMenu && (
      <Dropdown
        autoAdjustOverflow
        trigger={['contextMenu']}
        placement="bottomLeft"
        open
        onOpenChange={(val) => {
          if (!val) {
            designer.toggleContextMenu(val);
          }
        }}
        overlay={<ContextMenu onClick={() => designer.toggleContextMenu(false)} showParents />}
        {...props}
      >
        <Box
          width={0}
          height={0}
          position="absolute"
          style={{
            left: designer.contextMenuPosition.clientX,
            top: designer.contextMenuPosition.clientY,
            pointerEvents: 'none',
          }}
        />
      </Dropdown>
    )
  );
});

export function Viewport({ selectionTools, children, className, ...rest }: ViewportProps) {
  return (
    <Box position="relative" height="100%" className={cx('Viewport', className)} {...rest}>
      <ViewportContextMenu />
      <ViewportBody>{children}</ViewportBody>
      <div className="AuxTools">
        <SelectionTools actions={selectionTools} />
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
