import React, { useMemo } from 'react';
import { Box, Group } from 'coral-system';
import {
  HistoryTool,
  ModeSwitchTool,
  PreviewTool,
  RouteSwitchTool,
  TogglePanelTool,
} from '../widgets/toolbar';
import { ReactComponentProps } from '@music163/tango-helpers';

const internalToolMap = {
  history: <HistoryTool />,
  modeSwitch: <ModeSwitchTool />,
  preview: <PreviewTool />,
  routeSwitch: <RouteSwitchTool />,
  togglePanel: <TogglePanelTool />,
};

interface ToolbarPanelProps {
  children?: React.ReactElement | React.ReactElement[];
}

export function ToolbarPanel({ children }: ToolbarPanelProps) {
  const [left, center, right] = useMemo(() => {
    const left: React.ReactNode[] = [];
    const center: React.ReactNode[] = [];
    const right: React.ReactNode[] = [];

    let prevPlacement: string;
    React.Children.forEach(children, (child: React.ReactElement, index) => {
      let node = child.props.children || internalToolMap[child.key];
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
        {left}
      </Group>
      <Group display="flex" alignItems="center" gap="m">
        {center}
      </Group>
      <Group display="flex" alignItems="center" gap="m">
        {right}
      </Group>
    </Box>
  );
}

interface ToolbarPanelItemProps extends ReactComponentProps {
  placement?: 'left' | 'center' | 'right';
  children?: React.ReactElement;
}

function ToolbarPanelItem({ placement, children }: ToolbarPanelItemProps) {
  return <div>{children}</div>;
}

function Separator() {
  return <Box className="Separator" width={1} height={16} bg="gray.60" />;
}

ToolbarPanel.Item = ToolbarPanelItem;
ToolbarPanel.Separator = Separator;
