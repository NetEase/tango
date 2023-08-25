import { uuid } from '@music163/tango-helpers';
import React from 'react';
import { FormItemComponentProps } from '../form-item';
import { ListSetter, NewOptionFormFieldType } from './list-setter';

const optionFormFields: NewOptionFormFieldType[] = [
  { label: '文案', name: 'label', required: true },
  { label: '值', name: 'value', required: true },
];

const getKey = (item: any) => item.value;
const renderItem = (item: any) => item.label;

/**
 * 列表项设置器
 */
export function OptionSetter(props: FormItemComponentProps<any[]>) {
  return (
    <ListSetter
      getListItemKey={getKey}
      renderItem={renderItem}
      listItemFormFields={optionFormFields}
      getNewItemDefaultValues={() => {
        const randomStr = uuid('_', 4);
        return {
          label: `选项${randomStr}`,
          value: randomStr,
        };
      }}
      {...props}
    />
  );
}
