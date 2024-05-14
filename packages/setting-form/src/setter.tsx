import React, { useEffect, useState } from 'react';
import { Input, InputProps, Switch } from 'antd';
import { InputCode } from '@music163/tango-ui';
import { FormItemComponentProps, IFormItemCreateOptions, register } from './form-item';
import { Box, css } from 'coral-system';
import { getCodeOfWrappedCode, wrapCode } from '@music163/tango-helpers';

// TODO: 独立到单独的文件夹中
export function ExpressionSetter({
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

export function BoolSetter({ value, onChange, ...props }: FormItemComponentProps<boolean>) {
  return <Switch checked={value} onChange={(val) => onChange?.(val)} {...props} />;
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

const BASIC_SETTERS: IFormItemCreateOptions[] = [
  {
    name: 'expressionSetter',
    component: ExpressionSetter,
    disableVariableSetter: true,
  },
  {
    name: 'textSetter',
    component: TextSetter,
  },
  {
    name: 'boolSetter',
    component: BoolSetter,
  },
  // TODO: numberSetter
  {
    name: 'idSetter',
    component: IdSetter,
  },
];

export function registerBuiltinSetters() {
  // 预注册基础 Setter
  BASIC_SETTERS.forEach(register);
}
