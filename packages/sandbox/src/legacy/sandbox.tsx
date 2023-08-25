import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { builtinWorkspace as workspace } from '@music163/tango-core';
import { noop } from '@music163/tango-helpers';
import { render, refresh } from './render';

const SandboxContainer = styled.div`
  position: relative;
  min-height: 90%;
`;

type UrlResolverOptions = {
  baseUrl: string;
  url: string;
};

export interface LegacySandboxProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * url 地址拼装函数
   */
  urlResolver?: (options: UrlResolverOptions) => string;
  /**
   * 文件服务地址，用来追加到文件名的相对路径前
   */
  baseUrl: string;
  /**
   * 入口文件地址
   */
  entry: string;
  /**
   * 渲染后的回调
   */
  afterRender?: () => void;
  /**
   * MouduleReload 后的回调
   */
  afterReload?: () => void;
  /**
   * MoudleReload 后的执行 callback 的延迟的毫秒数
   */
  reloadTimeout?: number;
}

function defaultUrlResolver({ baseUrl, url }: UrlResolverOptions): string {
  let ret = url;
  if (url && url.indexOf(baseUrl) === -1) {
    ret = `${baseUrl}${url}`;
  }
  return ret;
}

/**
 * 基本的沙箱实现
 * TODO: 实现独立的基于 iframe 的沙箱
 */
export function LegacySandbox({
  urlResolver = defaultUrlResolver,
  baseUrl,
  entry: entryProps,
  afterRender = noop,
  afterReload = noop,
  reloadTimeout = 0,
  ...rest
}: LegacySandboxProps) {
  const entry = useMemo(() => {
    return urlResolver({
      url: entryProps,
      baseUrl,
    });
  }, [baseUrl, entryProps, urlResolver]);

  useEffect(() => {
    render({
      entry,
      callback: afterRender,
    });
  }, [entry, afterRender]);

  useEffect(() => {
    let timeout: any;
    workspace.on('refresh', (e: any) => {
      refresh({
        entry: urlResolver({ url: e.detail.entry, baseUrl }),
        callback: () => {
          timeout = setTimeout(afterReload, reloadTimeout);
        },
      });
    });
    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [baseUrl, urlResolver, afterReload, reloadTimeout]);

  return <SandboxContainer id="sandbox-container" className="Sandbox" {...rest} />;
}
