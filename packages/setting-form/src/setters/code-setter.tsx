import React, { useState } from 'react';
import { FormItemComponentProps } from '../form-item';
import { InputCode } from '@music163/tango-ui';

export function CodeSetter({
  value: valueProp,
  onChange,
  ...rest
}: FormItemComponentProps<string>) {
  const [value, setValue] = useState(valueProp || '');
  return (
    <InputCode
      onChange={(val) => {
        setValue(val);
      }}
      onBlur={() => {
        onChange?.(value);
      }}
      value={value}
      {...rest}
    />
  );
}
