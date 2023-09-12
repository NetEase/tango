import React, { useMemo } from 'react';
import { Select } from 'antd';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { ListStore, OptionType } from '@music163/tango-helpers';

const style = {
  width: '100%',
};

export function PickerSetter({ options, onChange, ...props }: FormItemComponentProps) {
  const optionsStore = useMemo(() => {
    return new ListStore<OptionType>({
      data: options,
    });
  }, [options]);
  return (
    <Select
      showSearch
      allowClear
      style={style}
      placeholder="请选择"
      options={options}
      onChange={(val) => {
        const option = optionsStore.getNode(val);
        const detail = option?.relatedImports
          ? { relatedImports: option.relatedImports }
          : undefined;
        onChange?.(val, detail);
      }}
      {...props}
    />
  );
}
