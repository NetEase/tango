import React from 'react';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { InputKV } from '../components';

export function EnumSetter(props: FormItemComponentProps<string>) {
  return <InputKV {...props} />;
}
