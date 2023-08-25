import React, { useEffect } from 'react';
import { SystemProvider } from 'coral-system';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { TangoEngineProvider, ITangoEngineContext } from '@music163/tango-context';
import { DesignerProvider, IDesignerContext } from './context';
import { theme as baseTheme } from './theme';
import { createFromIconfontCN } from '@ant-design/icons';

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
    theme: themeProp,
    sandboxQuery,
    remoteServices = {},
    iconfontScriptUrl = '//at.alicdn.com/t/c/font_2891794_lzc7rtwuzf.js',
    children,
  } = props;
  const theme = themeProp ?? baseTheme;
  useEffect(() => {
    createFromIconfontCN({
      scriptUrl: iconfontScriptUrl,
    });
  }, [iconfontScriptUrl]);
  return (
    <SystemProvider theme={theme} prefix="--tango">
      <ConfigProvider locale={zhCN}>
        <TangoEngineProvider value={{ engine }}>
          <DesignerProvider value={{ sandboxQuery, remoteServices }}>{children}</DesignerProvider>
        </TangoEngineProvider>
      </ConfigProvider>
    </SystemProvider>
  );
}
