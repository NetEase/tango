import React from 'react';
import { Input } from 'antd';
import { InputCode } from '@music163/tango-ui';
import { FormItemComponentProps } from './form-item';

export function ExpressionSetter({ value, onChange, ...rest }: FormItemComponentProps<string>) {
  return <InputCode onChange={(val) => onChange?.(val)} value={value || ''} {...rest} />;
}

export function TextSetter({ onChange, ...rest }: FormItemComponentProps<string>) {
  return <Input onChange={(e) => onChange?.(e.target.value)} {...rest} />;
}
