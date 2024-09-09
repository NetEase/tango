import { FormItemComponentProps } from '@music163/tango-setting-form';
import { ClassNameInput } from '@music163/tango-ui';
import React from 'react';

export function ClassNameSetter({ value, onChange }: FormItemComponentProps<string>) {
  return <ClassNameInput value={value} onChange={onChange} />;
}
