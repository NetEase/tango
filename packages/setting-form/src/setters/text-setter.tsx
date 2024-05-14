import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import { FormItemComponentProps } from '../form-item';

const noop = () => {};

export function TextSetter({
  value: valueProp,
  onChange = noop,
  placeholder = '请输入文本',
  ...props
}: FormItemComponentProps<string>) {
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
        if (valueState !== valueProp) {
          onChange(valueState);
        }
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
  placeholder = '请输入文本',
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
        if (valueState !== valueProp) {
          onChange(valueState);
        }
      }}
      autoSize={autoSize}
      {...props}
    />
  );
}
