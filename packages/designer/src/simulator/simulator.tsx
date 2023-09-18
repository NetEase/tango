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
  --device-viewport-width: 375px;
  --device-viewport-height: 812px;
  --device-frame-width: 13px;
  background-image: url(https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/21897838692/b1c5/2665/56db/10558c1bb2030d55ceabbcc74431de99.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  box-shadow: 0 2px 8px rgb(2 8 20 / 10%), 0 8px 16px rgb(2 8 20 / 8%);
  border-radius: 62px;
  overflow: hidden;

  .MobileSimulatorDeviceFrame {
    border-radius: 50px;
    width: var(--device-viewport-width);
    height: var(--device-viewport-height);
    margin: var(--device-frame-width);
    overflow: hidden;
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
