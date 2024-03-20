import React from 'react';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { ListSetter, NewOptionFormFieldType } from './list-setter';
import { ColorSetter } from './style-setter';
import { Badge, Select } from 'antd';
import { Box, Text } from 'coral-system';

const optionFormFields: NewOptionFormFieldType[] = [
  { label: 'value', name: 'value', required: true },
  { label: 'label', name: 'label', required: true },
  { label: '颜色', name: 'color', component: <ColorSetter onChange={() => {}} /> },
  {
    label: '状态',
    name: 'status',
    extra: '设置了颜色，该配置失效',
    component: (
      <Select
        allowClear
        options={['success', 'processing', 'error', 'warning', 'default'].map((item) => ({
          label: item,
          value: item,
        }))}
      />
    ),
  },
];

const getKey = (item: any) => item.value;
const renderItem = (item: any) => {
  return (
    <Box display="inline-flex" alignItems="center" gap="12px">
      <Text>{`${item.value}：${item.label}`}</Text>
      {item.color && (
        <Box bg={item.color} border="solid" borderColor="gray.40" size="14px" borderRadius="s" />
      )}
      {!item.color && item.status && <Badge dot status={item.status} text={item.status} />}
    </Box>
  );
};

/**
 * TagEnumMap设置器
 */
export function TagEnumMapSetter(props: FormItemComponentProps<any[]>) {
  return (
    <ListSetter
      getListItemKey={getKey}
      renderItem={renderItem}
      listItemFormFields={optionFormFields}
      {...props}
    />
  );
}
