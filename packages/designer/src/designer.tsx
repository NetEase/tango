import React, { useMemo } from 'react';
import { SystemProvider, extendTheme } from 'coral-system';
import { ConfigProvider } from 'antd';
import { TangoEngineProvider, ITangoEngineContext } from '@music163/tango-context';
import zhCN from 'antd/lib/locale/zh_CN';
import { DesignerProvider, IDesignerContext } from './context';
import defaultTheme from './themes/default';
import { DndQuery } from './dnd';
import { DESIGN_SANDBOX_ID, PREVIEW_SANDBOX_ID } from './helpers';

const builtinSandboxQuery = new DndQuery({
  context: `#${DESIGN_SANDBOX_ID}`,
});

const builtinPreviewSandboxQuery = new DndQuery({
  context: `#${PREVIEW_SANDBOX_ID}`,
});

export interface DesignerProps extends Partial<IDesignerContext>, ITangoEngineContext {
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
  const {
    engine,
    config,
    theme: themeProp,
    sandboxQuery = builtinSandboxQuery,
    previewSandboxQuery = builtinPreviewSandboxQuery,
    remoteServices = {},
    children,
  } = props;
  const theme = useMemo(() => extendTheme(themeProp, defaultTheme), [themeProp]);
  return (
    <SystemProvider theme={theme} prefix="--tango">
      <ConfigProvider locale={zhCN}>
        <TangoEngineProvider value={{ engine, config }}>
          <DesignerProvider value={{ sandboxQuery, previewSandboxQuery, remoteServices }}>
            {children}
          </DesignerProvider>
        </TangoEngineProvider>
      </ConfigProvider>
    </SystemProvider>
  );
}
