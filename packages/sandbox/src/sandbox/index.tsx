import React from 'react';
import ViteSandbox from '../vite-sandbox';
import { CodeSandbox } from '../code-sandbox';
import { CodeSandboxProps as ProSandboxProps } from '../types';
import { enhanceFiles } from './helper';

/**
 * @deprecated 已废弃，请直接使用 CodeSandbox
 */
export function ProSandbox({ moduleType = 'cjs', ...props }: ProSandboxProps) {
  if (moduleType === 'esm') {
    return (
      <ViteSandbox
        bundlerURL="https://vitesandbox.fn.netease.com"
        files={enhanceFiles(props.files, props.entry)}
        {...props}
      />
    );
  } else {
    return (
      <CodeSandbox
        bundlerURL="https://codesandbox.fn.netease.com"
        files={enhanceFiles(props.files, props.entry)}
        {...props}
      />
    );
  }
}

export type { ProSandboxProps };
