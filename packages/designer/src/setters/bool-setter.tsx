import React from 'react';
import { Switch } from 'antd';
import { FormItemComponentProps } from '@music163/tango-setting-form/src/form-item';

export function BoolSetter({ value, onChange, ...props }: FormItemComponentProps<boolean>) {
  return <Switch checked={value} onChange={(val) => onChange?.(val)} {...props} />;
}
