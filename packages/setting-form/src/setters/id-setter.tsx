import React, { useEffect, useState } from 'react';
import { Input, InputProps } from 'antd';
import { css, Box } from 'coral-system';
import { FormItemComponentProps } from '../form-item';

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
