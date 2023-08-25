import React, { useState } from 'react';
import { Box } from 'coral-system';
import { Button, Select, Tooltip, SelectProps } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export interface SelectListProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options?: SelectProps['options'];
  isUniqueValue?: boolean;
}

export function SelectList({
  value = [],
  onChange,
  options = [],
  isUniqueValue = false,
}: SelectListProps) {
  const [isAdding, setIsAdding] = useState(false);
  if (isUniqueValue) {
    options = options.filter((option) => value.indexOf(option.value as string) < 0);
  }
  return (
    <Box>
      {!value.length && !isAdding && <Box color="text.note">空</Box>}
      <Box display="flex" flexDirection="column" gap="m">
        {value.map((item, index) => (
          <SelectListItem
            key={index}
            options={options}
            value={item}
            onChange={(newItem) => {
              if (newItem === item) return;
              const newValue = [...value];
              newValue[index] = newItem;
              onChange?.(newValue);
            }}
            onRemove={() => {
              const newValue = [...value];
              newValue.splice(index, 1);
              onChange?.(newValue);
            }}
          />
        ))}
        {isAdding && (
          <SelectListItem
            options={options}
            onChange={(val) => {
              if (!val) return;
              onChange?.(value.concat([val]));
              setIsAdding(false);
            }}
            onRemove={() => {
              setIsAdding(false);
            }}
          />
        )}
      </Box>
      <Box mt="m">
        <Button icon={<PlusOutlined />} onClick={() => setIsAdding(true)}>
          新增
        </Button>
      </Box>
    </Box>
  );
}

const selectStyle = {
  flex: 1,
};

function SelectListItem({
  value,
  onChange,
  onRemove,
  options,
}: {
  value?: string;
  onChange?: (value: string) => void;
  onRemove?: () => void;
  options?: SelectProps['options'];
}) {
  return (
    <Box display="flex" gap="m">
      <Select
        placeholder="请选择"
        options={options}
        value={value}
        onChange={(val) => {
          onChange?.(val);
        }}
        style={selectStyle}
      />
      <Tooltip title="删除">
        <Button type="text" icon={<DeleteOutlined />} onClick={onRemove} />
      </Tooltip>
    </Box>
  );
}
