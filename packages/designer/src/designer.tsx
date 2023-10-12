import React, { useEffect, useMemo } from 'react';
import { SystemProvider, extendTheme } from 'coral-system';
import { ConfigProvider } from 'antd';
import { TangoEngineProvider, ITangoEngineContext } from '@music163/tango-context';
import { createFromIconfontCN } from '@ant-design/icons';
import { DesignerProvider, IDesignerContext } from './context';
import { theme as baseTheme } from './theme';
import zhCN from 'antd/lib/locale/zh_CN';

export interface DesignerProps extends IDesignerContext, ITangoEngineContext {
  /**
   * 主题包
   */
  theme?: any;
  /**
   * 自定义图表库svg脚本地址
   */
  iconfontScriptUrl?: string;
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
    sandboxQuery,
    remoteServices = {},
    iconfontScriptUrl = '//at.alicdn.com/t/c/font_2891794_lzc7rtwuzf.js',
    children,
  } = props;
  const theme = useMemo(() => extendTheme(themeProp, baseTheme), [themeProp]);
  useEffect(() => {
    createFromIconfontCN({
      scriptUrl: iconfontScriptUrl,
    });
  }, [iconfontScriptUrl]);
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
