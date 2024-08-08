import React from 'react';
import { css, Box, HTMLCoralProps } from 'coral-system';
import { observer, useDesigner } from '@music163/tango-context';

export interface SimulatorProps {
  children?: React.ReactNode;
}

/**
 * PC Simulator
 * 页面模拟容器，支持模拟多种设备
 */
export const Simulator = observer(({ children }: SimulatorProps) => {
  const designer = useDesigner();
  const Sim = designer.simulator.name === 'desktop' ? DesktopSimulator : MobileSimulator;
  return <Sim>{children}</Sim>;
});

function DesktopSimulator({ children }: HTMLCoralProps<'div'>) {
  return (
    <Box className="DesktopSimulator" height="100%">
      {children}
    </Box>
  );
}

const mobileStyle = css`
  --device-viewport-width: 360px;
  --device-viewport-height: 640px;
  position: relative;
  margin: auto;
  border: 16px black solid;
  border-top-width: 60px;
  border-bottom-width: 60px;
  border-radius: 36px;

  &::before {
    content: '';
    display: block;
    width: 60px;
    height: 5px;
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #333;
    border-radius: 10px;
  }

  &::after {
    content: '';
    display: block;
    width: 35px;
    height: 35px;
    position: absolute;
    left: 50%;
    bottom: -65px;
    transform: translate(-50%, -50%);
    background: #333;
    border-radius: 50%;
  }

  .MobileSimulatorDeviceFrame {
    width: var(--device-viewport-width);
    height: var(--device-viewport-height);
    background: white;
  }
`;

function MobileSimulator({ children }: HTMLCoralProps<'div'>) {
  return (
    <Box className="MobileSimulator" pt="xl" display="flex" justifyContent="center">
      <Box className="MobileSimulatorDeviceWrapper" css={mobileStyle}>
        <Box className="MobileSimulatorDeviceFrame">{children}</Box>
      </Box>
    </Box>
  );
}
