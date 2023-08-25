import React, { useEffect, useState } from 'react';
import { Input, InputProps } from 'antd';
import { FormItemComponentProps } from '../form-item';

const noop = () => {};

type TextSetterProps = {
  value?: string;
  onChange?: (value: string) => void;
} & Omit<InputProps, 'onChange' | 'value'>;

export function TextSetter({
  value: valueProp,
  onChange = noop,
  placeholder = '请输入',
  ...props
}: TextSetterProps) {
  const [valueState, setValue] = useState(valueProp);

  useEffect(() => {
    setValue(valueProp);
  }, [valueProp]);

  return (
    <Input
      placeholder={placeholder}
      allowClear
      value={valueState}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        onChange(valueState);
      }}
      {...props}
    />
  );
}

const autoSize = {
  minRows: 2,
  maxRows: 5,
};

export function TextAreaSetter({
  value: valueProp,
  onChange = noop,
  placeholder = '请输入',
  ...props
}: FormItemComponentProps<string>) {
  const [valueState, setValue] = useState(valueProp);

  useEffect(() => {
    setValue(valueProp);
  }, [valueProp]);

  return (
    <Input.TextArea
      placeholder={placeholder}
      allowClear
      value={valueState}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        onChange(valueState);
      }}
      autoSize={autoSize}
      {...props}
    />
  );
}
