import React, { useEffect, useState } from 'react';
import { Input, InputProps, Tooltip } from 'antd';
import { css, Box } from 'coral-system';
import { FormItemComponentProps } from '../form-item';
import { ExclamationCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Action } from '@music163/tango-ui';

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
  getId,
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
          setError(
            newValue && !idPattern.test(newValue)
              ? '非法的组件ID，必须使用字母开头的字母数字组合，例如 button1'
              : '',
          );
        },
      }
    : {
        readOnly: true,
        bordered: false,
        onClick() {
          setEditable(true);
        },
      };

  const showQuickIdButton = !value || error; // 没有设置 id 或 id 不合法的时候显示快捷生成按钮

  return (
    <Box css={idInputStyle}>
      <Input
        placeholder={placeholder}
        value={value}
        {...__props}
        {...rest}
        prefix={
          error ? (
            <Tooltip title={error} color="#ff4d4f">
              <ExclamationCircleOutlined style={{ color: 'red' }} />
            </Tooltip>
          ) : null
        }
        suffix={
          showQuickIdButton ? (
            <Action
              size="small"
              icon={<ThunderboltOutlined />}
              tooltip="快捷设置组件ID"
              onClick={() => {
                const id = getId?.();
                if (id) {
                  setValue(id);
                  onChange?.(id);
                }
              }}
            />
          ) : null
        }
      />
    </Box>
  );
}
