import React from 'react';
import { isFunction, isNil, isString } from '@music163/tango-helpers';
import { InputCode, JsonView, JsonViewProps } from '@music163/tango-ui';
import { Empty } from 'antd';

interface ValuePreviewProps {
  value?: unknown;
  /**
   * 选择预览结点的回调
   */
  onCopy?: JsonViewProps['onCopy'];
}

export function ValuePreview({ value, onCopy }: ValuePreviewProps) {
  if (isNil(value)) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂时没有可预览的数据" />;
  }

  if (isFunction(value)) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂不支持预览函数" />;
  }

  if (typeof value === 'object') {
    return <JsonView src={value} enableCopy onCopy={onCopy} />;
  }

  return (
    <InputCode
      shape="inset"
      value={isString(value) ? `"${value}"` : String(value)}
      editable={false}
    />
  );
}
