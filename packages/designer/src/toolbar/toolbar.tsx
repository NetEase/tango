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
      const childProps = child.props;

      let fallbackNode;
      if (child.key) {
        const Widget = getWidget(['toolbar', child.key].join('.'));
        if (Widget) {
          fallbackNode = (
            <ToolbarItem>
              <Widget {...childProps.widgetProps} />
            </ToolbarItem>
          );
        }
      }

      let node;
      if (childProps.children) {
        // 自定义子节点
        node = child;
      } else {
        // 预注册的子节点
        node = fallbackNode || child;
      }
      const key = child.key || index;
      node = React.cloneElement(node, { key, 'data-key': key });

      const placement = childProps.placement || prevPlacement || 'center';
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
      <Group display="flex" alignItems="center" justifyContent="flex-end" gap="m">
        {rightTools}
      </Group>
    </Box>
  );
}

export interface ToolbarItemProps extends ReactComponentProps {
  /**
   * 类型
   */
  type?: 'divider';
  placement?: 'left' | 'center' | 'right';
  children?: React.ReactElement;
  /**
   * 如果 key 匹配到内置组件的话，传递给子节点的属性
   */
  widgetProps?: object;
}

function ToolbarItem({ type, placement, widgetProps, children, ...rest }: ToolbarItemProps) {
  if (type === 'divider') {
    return <Separator />;
  }
  return (
    <div className="ToolbarPanelItem" {...rest}>
      {children}
    </div>
  );
}

function Separator() {
  return <Box className="Separator" width={1} height={16} bg="colors.custom.toolbarDividerColor" />;
}

Toolbar.Item = ToolbarItem;
Toolbar.Separator = Separator;
