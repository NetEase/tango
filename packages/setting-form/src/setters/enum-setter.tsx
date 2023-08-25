import React from 'react';
import { FormItemComponentProps } from '../form-item';
import { InputKV } from '../components';

export function EnumSetter(props: FormItemComponentProps<string>) {
  return <InputKV {...props} />;
}
