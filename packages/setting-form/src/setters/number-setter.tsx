import React from 'react';
import { InputNumber, Slider } from 'antd';
import { FormItemComponentProps } from '../form-item';

const style = {
  width: '100%',
};

export function NumberSetter({ onChange, ...props }: FormItemComponentProps<number>) {
  return (
    <InputNumber
      placeholder="请输入数字"
      style={style}
      onChange={(val) => {
        if (val === null) {
          val = undefined;
        }
        onChange && onChange(val);
      }}
      {...props}
    />
  );
}

export function SliderSetter(props: FormItemComponentProps<number>) {
  return <Slider {...props} />;
}
