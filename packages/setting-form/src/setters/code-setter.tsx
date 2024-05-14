import React, { useState } from 'react';
import { FormItemComponentProps } from '../form-item';
import { InputCode } from '@music163/tango-ui';
import { getCodeOfWrappedCode, wrapCode } from '@music163/tango-helpers';

export function CodeSetter({
  value: valueProp,
  onChange,
  ...rest
}: FormItemComponentProps<string>) {
  const [value, setValue] = useState(getCodeOfWrappedCode(valueProp) || '');
  return (
    <InputCode
      onChange={(val) => {
        setValue(val);
      }}
      onBlur={() => {
        const newCode = value ? wrapCode(value) : undefined;
        onChange?.(newCode);
      }}
      value={value}
      {...rest}
    />
  );
}
