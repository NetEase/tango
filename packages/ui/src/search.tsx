import React from 'react';
import { Text } from 'coral-system';
import { Input, InputProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export interface SearchProps extends Omit<InputProps, 'onChange'> {
  width?: string;
  onChange?: (value: string) => void;
  /**
   * value 是否转义
   */
  escapeValue?: boolean;
}

export function Search({
  placeholder = '请输入关键词',
  onChange,
  width,
  escapeValue = true,
  style: styleProp = {},
  ...rest
}: SearchProps) {
  const style = {
    width,
    ...styleProp,
  };
  return (
    <Input
      placeholder={placeholder}
      onChange={(e) => {
        let next = e.target.value;
        if (escapeValue) {
          next = next.replaceAll('\\', '\\\\');
        }
        onChange?.(next);
      }}
      suffix={
        <Text color="text.placeholder">
          <SearchOutlined />
        </Text>
      }
      allowClear
      style={style}
      {...rest}
    />
  );
}
