import React, { useMemo } from 'react';
import { Box, Group } from 'coral-system';
import { ReactComponentProps } from '@music163/tango-helpers';
import { HistoryTool } from './history';
import { ModeSwitchTool } from './mode-switch';
import { PreviewTool } from './preview';
import { RouteSwitchTool } from './route-switch';
import { TogglePanelTool } from './toggle-panel';

export interface ToolbarProps {
  children?: React.ReactElement | React.ReactElement[];
  builtinToolMap?: Record<string, React.ReactNode>;
}

const builtinToolsMap = {
  history: <HistoryTool />,
  modeSwitch: <ModeSwitchTool />,
  preview: <PreviewTool />,
  routeSwitch: <RouteSwitchTool />,
  togglePanel: <TogglePanelTool />,
};

export function Toolbar({ children, builtinToolMap = builtinToolsMap }: ToolbarProps) {
  const [leftTools, centerTools, rightTools] = useMemo(() => {
    const left: React.ReactNode[] = [];
    const center: React.ReactNode[] = [];
    const right: React.ReactNode[] = [];

    let prevPlacement: string;
    React.Children.forEach(children, (child: React.ReactElement, index) => {
      let node = child.props.children || builtinToolMap[child.key];
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
}

function ToolbarItem({ placement, children }: ToolbarItemProps) {
  return <div>{children}</div>;
}

function Separator() {
  return <Box className="Separator" width={1} height={16} bg="gray.60" />;
}

Toolbar.Item = ToolbarItem;
Toolbar.Separator = Separator;
