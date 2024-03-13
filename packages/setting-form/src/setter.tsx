import React, { useEffect, useState } from 'react';
import { Input, InputProps } from 'antd';
import { InputCode } from '@music163/tango-ui';
import { FormItemComponentProps, register } from './form-item';
import { Box, css } from 'coral-system';

export function ExpressionSetter({ value, onChange, ...rest }: FormItemComponentProps<string>) {
  return <InputCode onChange={(val) => onChange?.(val)} value={value || ''} {...rest} />;
}

export function TextSetter({ onChange, ...rest }: FormItemComponentProps<string>) {
  return <Input onChange={(e) => onChange?.(e.target.value)} {...rest} />;
}

const idInputStyle = css`
  > .ant-input-borderless {
    border: 1px solid transparent;
    padding: 4px;
  }

  > .ant-input-borderless:hover {
    background-color: var(--tango-colors-fill1);
  }
`;

const idPattern = /^[a-z]+[\w]*$/;

export function IdSetter({
  value: valueProp,
  defaultValue,
  onChange,
  placeholder = '输入唯一组件ID',
  ...rest
}: FormItemComponentProps<string>) {
  const [value, setValue] = useState(valueProp || defaultValue);
  const [error, setError] = useState('');
  const [editable, setEditable] = useState(false);

  // value controlled
  useEffect(() => {
    setValue(valueProp);
  }, [valueProp]);

  const __props: InputProps = editable
    ? {
        status: error ? 'error' : undefined,
        onBlur() {
          setEditable(false);
          if (!error) {
            onChange?.(value || undefined);
          }
        },
        onChange(e) {
          const newValue = e.target.value;
          setValue(e.target.value);
          setError(newValue && !idPattern.test(newValue) ? 'error' : '');
        },
      }
    : {
        readOnly: true,
        bordered: false,
        onClick() {
          setEditable(true);
        },
      };

  return (
    <Box css={idInputStyle}>
      <Input placeholder={placeholder} value={value} {...__props} {...rest} />
    </Box>
  );
}

export function registerBuiltinSetters() {
  // 预注册基础 Setter
  register({
    name: 'expressionSetter',
    component: ExpressionSetter,
  });

  register({
    name: 'textSetter',
    component: TextSetter,
  });

  register({
    name: 'idSetter',
    component: IdSetter,
  });
}
