import React from 'react';
import ReactJsonView, { ReactJsonViewProps } from 'react-json-view';

export type JsonViewProps = Omit<ReactJsonViewProps, 'onSelect'> & {
  /**
   * 允许复制
   */
  enableCopy?: boolean;
  /**
   * 点击复制按钮的回调
   * @param valuePath value 的路径
   * @param data { src, namespace, name }
   * @returns
   */
  onCopy?: (valuePath: string, data: any) => string;
};

export function JsonView({ enableCopy, onCopy, ...rest }: JsonViewProps) {
  return (
    <ReactJsonView
      name={false}
      iconStyle="square"
      quotesOnKeys={false}
      displayDataTypes={false}
      enableClipboard={
        enableCopy
          ? (data) => {
              const valuePath = getJsonValuePath(data.namespace);
              const ret = onCopy?.(valuePath, data);
              navigator.clipboard.writeText(ret || valuePath);
            }
          : false
      }
      {...rest}
    />
  );
}

const numPattern = /^\d+$/;

function getJsonValuePath(namespace: any[]): string {
  if (!Array.isArray(namespace)) {
    return;
  }

  if (namespace[0] === false) {
    namespace = namespace.slice(1);
  }

  return [...namespace].reduce((prev, cur) => {
    if (numPattern.test(cur)) {
      prev = `${prev}[${cur}]`;
    } else {
      prev = prev ? [prev, cur].join('?.') : cur;
    }
    return prev;
  }, '');
}
