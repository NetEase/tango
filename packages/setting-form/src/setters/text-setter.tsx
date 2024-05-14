import React from 'react';
import { Input } from 'antd';
import { FormItemComponentProps } from '../form-item';

export function TextSetter({ onChange, ...rest }: FormItemComponentProps<string>) {
  return <Input onChange={(e) => onChange?.(e.target.value)} placeholder="请输入文本" {...rest} />;
}
