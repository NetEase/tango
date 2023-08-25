import React from 'react';
import { Switch } from 'antd';
import { Box } from 'coral-system';
import { FieldStringOutlined } from '@ant-design/icons';
import { FormItemComponentProps } from '../form-item';
import { ListSetter, NewOptionFormFieldType } from './list-setter';

const defaultNewOptionValue = {
  // key: 'c1',
  // dataIndex: 'option',
  title: 'Column',
  // width: '200px',
};

const optionFormFields: NewOptionFormFieldType[] = [
  { label: 'key', name: 'key', required: true },
  { label: 'dataIndex', name: 'dataIndex', required: true },
  { label: '列标题', name: 'title', required: true },
  { label: '列宽', name: 'width' },
  { label: '锁列', name: 'fixed', valuePropName: 'checked', component: <Switch /> },
];

const renderSetterItem = (item: any) => {
  return (
    <>
      <FieldStringOutlined />
      <Box display="inline-block" ml="m">
        {item.title}
      </Box>
    </>
  );
};

/**
 * 表格列设置器
 */
export function ColumnSetter(props: FormItemComponentProps<any[]>) {
  return (
    <ListSetter
      getListItemKey={(item) => item.key || item.dataIndex}
      addBtnText="添加新列"
      listItemFormFields={optionFormFields}
      newItemDefaultValues={defaultNewOptionValue}
      renderItem={renderSetterItem}
      {...props}
    />
  );
}
