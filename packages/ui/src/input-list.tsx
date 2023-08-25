import React, { useState } from 'react';
import { Box } from 'coral-system';
import { Button, Input, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export interface InputListProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export function InputList({ value = [], onChange }: InputListProps) {
  const [isAdding, setIsAdding] = useState(false);
  return (
    <Box>
      {!value.length && !isAdding && <Box color="text.note">空</Box>}
      <Box display="flex" flexDirection="column" gap="m">
        {value.map((item, index) => (
          <InputListItem
            key={index}
            value={item}
            onBlur={(newItem) => {
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
          <InputListItem
            onBlur={(val) => {
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

function InputListItem({
  value: valueProp,
  onChange,
  onBlur,
  onRemove,
}: {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onRemove?: () => void;
}) {
  const [value, setValue] = useState(valueProp);
  return (
    <Box display="flex" gap="m">
      <Input
        placeholder="请输入"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        onBlur={() => onBlur?.(value)}
      />
      <Tooltip title="删除">
        <Button type="text" icon={<DeleteOutlined />} onClick={onRemove} />
      </Tooltip>
    </Box>
  );
}
