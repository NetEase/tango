import React, { useMemo } from 'react';
import { SystemProvider, extendTheme } from 'coral-system';
import { ConfigProvider } from 'antd';
import { TangoEngineProvider, ITangoEngineContext } from '@music163/tango-context';
import zhCN from 'antd/lib/locale/zh_CN';
import { DesignerProvider, IDesignerContext } from './context';
import defaultTheme from './themes/default';

export interface DesignerProps extends IDesignerContext, ITangoEngineContext {
  /**
   * 主题包
   */
  theme?: any;
  children?: React.ReactNode;
}

/**
 * 设计器状态和设置容器
 * @param props
 * @returns
 */
export function Designer(props: DesignerProps) {
  const { engine, config, theme: themeProp, sandboxQuery, remoteServices = {}, children } = props;
  const theme = useMemo(() => extendTheme(themeProp, defaultTheme), [themeProp]);
  return (
    <SystemProvider theme={theme} prefix="--tango">
      <ConfigProvider locale={zhCN}>
        <TangoEngineProvider value={{ engine, config }}>
          <DesignerProvider value={{ sandboxQuery, remoteServices }}>{children}</DesignerProvider>
        </TangoEngineProvider>
      </ConfigProvider>
    </SystemProvider>
  );
}
