import React, { useCallback, useMemo, useState } from 'react';
import { Box } from 'coral-system';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import { IconFont, DragPanel } from '@music163/tango-ui';
import { ComponentsPanel, ComponentsPanelProps } from '../sidebar';
import { IComponentPrototype } from '@music163/tango-helpers';

interface ComponentsPopoverProps {
  // 添加组件位置
  type?: 'inner' | 'before' | 'after';
  // 弹出方式 手动触发/DOM 触发
  isControlled?: boolean;
  title?: string;
  prototype?: IComponentPrototype;
  children?: React.ReactNode;
}

export const ComponentsPopover = observer(
  ({
    type = 'inner',
    title = '添加组件',
    isControlled = false,
    children,
    ...popoverProps
  }: ComponentsPopoverProps) => {
    const [layout, setLayout] = useState<ComponentsPanelProps['layout']>('grid');
    const workspace = useWorkspace();
    const designer = useDesigner();

    const { addComponentPopoverPosition, showAddComponentPopover } = designer;
    const selectedNode = workspace.selectSource.selected?.[0];
    const selectedNodeId = selectedNode?.codeId ?? '未选中';
    const prototype =
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      workspace.componentPrototypes.get(selectedNode?.name) ?? ({} as IComponentPrototype);

    // 推荐使用的子组件
    const insertedList = useMemo(
      () =>
        Array.isArray(prototype?.childrenName)
          ? prototype?.childrenName
          : [prototype?.childrenName].filter(Boolean),
      [prototype?.childrenName],
    );

    // 推荐使用的代码片段
    const siblingList = useMemo(() => prototype?.siblingNames ?? [], [prototype.siblingNames]);

    const tipsTextMap = useMemo(
      () => ({
        before: `点击，在 ${selectedNodeId} 的前方添加节点`,
        after: `点击，在 ${selectedNodeId} 的后方添加节点`,
        inner: `点击，在 ${selectedNodeId} 内部添加节点`,
      }),
      [selectedNodeId],
    );

    const handleSelect = useCallback(
      (name: string) => {
        switch (type) {
          case 'before':
            workspace.insertBeforeSelectedNode(name);
            break;
          case 'after':
            workspace.insertAfterSelectedNode(name);
            break;
          case 'inner':
            workspace.insertToSelectedNode(name);
            break;
          default:
            break;
        }
      },
      [type, workspace],
    );

    const changeLayout = useCallback(() => {
      setLayout(layout === 'grid' ? 'line' : 'grid');
    }, [layout]);

    const menuData = useMemo(() => {
      const menuList = JSON.parse(JSON.stringify(designer.menuData));

      const commonList = menuList['common'] ?? [];
      if (commonList?.length && siblingList?.length) {
        commonList.unshift({
          title: '代码片段',
          items: siblingList,
        });
      }

      if (commonList?.length && insertedList?.length) {
        commonList.unshift({
          title: '推荐使用',
          items: insertedList,
        });
      }

      return menuList;
    }, [insertedList, siblingList, designer.menuData]);

    const innerTypeProps =
      // 手动触发 适用于 点击添加组件
      type === 'inner' && isControlled
        ? {
            open: showAddComponentPopover,
            onOpenChange: (open: boolean) => designer.toggleAddComponentPopover(open),
            left: addComponentPopoverPosition.clientX,
            top: addComponentPopoverPosition.clientY,
          }
        : {};

    return (
      <DragPanel
        {...innerTypeProps}
        title={title}
        extra={
          <Box fontSize="12px">
            {layout === 'grid' ? (
              <IconFont type="icon-liebiaoitem" onClick={changeLayout} />
            ) : (
              <IconFont type="icon-grid1" onClick={changeLayout} />
            )}
          </Box>
        }
        footer={tipsTextMap[type]}
        width="330px"
        height="450px"
        resizeable
        maskClosable
        body={
          <ComponentsPanel
            isScope
            showBizComps={false}
            menuData={menuData}
            layout={layout}
            onItemSelect={handleSelect}
          />
        }
        {...popoverProps}
      >
        {children}
      </DragPanel>
    );
  },
);
