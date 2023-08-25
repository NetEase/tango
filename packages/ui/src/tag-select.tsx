import React from 'react';
import { Box } from 'coral-system';
import { Tag } from 'antd';
import { useControllableState, warning } from '@music163/tango-helpers';

export interface TagSelectProps {
  /**
   * 默认值
   */
  defaultValue?: string[];
  /**
   * 受控值
   */
  value?: string[];
  /**
   * 值变化时的回调
   */
  onChange?: (value: string[]) => void;
  /**
   * 选项列表
   */
  options?: Array<{ label: string; value: string; disabled?: boolean }>;
  /**
   * 选择模式，单选或多选
   */
  mode?: 'single' | 'multiple';
  className?: string;
  style?: React.CSSProperties;
}

export function TagSelect({
  value: valueProp,
  defaultValue = [],
  onChange,
  options,
  mode = 'multiple',
  ...rest
}: TagSelectProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange,
  });

  if (mode === 'single' && value.length > 1) {
    warning(false, '单选模式下 value 只能有一个值！');
  }

  return (
    <Box className="TangoTagSelect" {...rest}>
      {options.map((option) => (
        <Tag.CheckableTag
          className={option.disabled ? 'disabled' : undefined}
          key={option.value}
          checked={value.includes(option.value)}
          onChange={(checked) => {
            if (mode === 'multiple') {
              if (checked) {
                setValue([...value, option.value]);
              } else {
                setValue(value.filter((item) => item !== option.value));
              }
            } else {
              checked ? setValue([option.value]) : setValue([]);
            }
          }}
        >
          {option.label}
        </Tag.CheckableTag>
      ))}
    </Box>
  );
}
