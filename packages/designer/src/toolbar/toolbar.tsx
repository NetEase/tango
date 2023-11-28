import React, { useMemo } from 'react';
import { Box, Group } from 'coral-system';
import { ReactComponentProps } from '@music163/tango-helpers';
import { getWidget } from '../widgets';

export interface ToolbarProps {
  children?: React.ReactElement | React.ReactElement[];
}

export function Toolbar({ children }: ToolbarProps) {
  const [leftTools, centerTools, rightTools] = useMemo(() => {
    const left: React.ReactNode[] = [];
    const center: React.ReactNode[] = [];
    const right: React.ReactNode[] = [];

    let prevPlacement: string;
    React.Children.forEach(children, (child: React.ReactElement, index) => {
      let fallbackNode;
      if (child.key) {
        const Widget = getWidget(['toolbar', child.key].join('.'));
        if (Widget) {
          fallbackNode = React.createElement(Widget, child.props.widgetProps);
        }
      }

      let node = child.props.children ?? fallbackNode ?? null;
      if (!node) {
        node = child; // separator
      }
      const key = child.key || index;
      node = (
        <div key={key} className="ToolbarPanelItem" data-key={key}>
          {node}
        </div>
      );
      const placement = child.props.placement || prevPlacement || 'center';
      switch (placement) {
        case 'left':
          left.push(node);
          break;
        case 'right':
          right.push(node);
          break;
        case 'center':
        default:
          center.push(node);
          break;
      }
      prevPlacement = placement;
    });

    return [left, center, right];
  }, [children]);

  return (
    <Box className="ToolbarPanel" display="flex" justifyContent="space-between" alignItems="center">
      <Group display="flex" alignItems="center" gap="m">
        {leftTools}
      </Group>
      <Group display="flex" alignItems="center" gap="m">
        {centerTools}
      </Group>
      <Group display="flex" alignItems="center" gap="m">
        {rightTools}
      </Group>
    </Box>
  );
}

export interface ToolbarItemProps extends ReactComponentProps {
  placement?: 'left' | 'center' | 'right';
  children?: React.ReactElement;
  /**
   * 如果 key 匹配到内置组件的话，传递给子节点的属性
   */
  widgetProps?: object;
}

function ToolbarItem({ placement, widgetProps, children }: ToolbarItemProps) {
  return <div>{children}</div>;
}

function Separator() {
  return <Box className="Separator" width={1} height={16} bg="colors.custom.toolbarDividerColor" />;
}

Toolbar.Item = ToolbarItem;
Toolbar.Separator = Separator;
