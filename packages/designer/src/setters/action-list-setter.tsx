import React from 'react';
import { Select } from 'antd';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { ListSetter, NewOptionFormFieldType } from './list-setter';

const defaultNewOptionValue = {
  key: '1',
  label: '按钮',
};

const shapes = [
  { label: '普通按钮', value: 'button' },
  { label: '文本按钮', value: 'text' },
];

const buttonTypes = [
  { label: '主要', value: 'primary' },
  { label: '次要', value: 'secondary' },
  { label: '普通', value: 'normal' },
];

const types = [
  { label: '普通动作', value: 'action' },
  { label: '确认提示', value: 'confirm' },
];

const optionFormFields: NewOptionFormFieldType[] = [
  { label: 'key', name: 'key', required: true },
  { label: '文本', name: 'label', required: true },
  { label: '外观', name: 'shape', component: <Select placeholder="请选择" options={shapes} /> },
  {
    label: '按钮类型',
    name: 'buttonType',
    component: <Select placeholder="请选择" options={buttonTypes} />,
  },
  { label: '类型', name: 'actionType', component: <Select placeholder="请选择" options={types} /> },
  { label: '确认气泡内容', name: 'confirmContent' },
];

const getKey = (item: any) => item.key;
const renderItem = (item: any) => item.label;

/**
 * 列表项设置器
 */
export function ActionListSetter(props: FormItemComponentProps<any[]>) {
  return (
    <ListSetter
      getListItemKey={getKey}
      renderItem={renderItem}
      listItemFormFields={optionFormFields}
      newItemDefaultValues={defaultNewOptionValue}
      {...props}
    />
  );
}
