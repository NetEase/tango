import React from 'react';
import { Box } from 'coral-system';
import { observer } from 'mobx-react-lite';
import { IComponentProp } from '@music163/tango-helpers';
import { SettingFormItem } from './form-item';
import { FormModelProvider, useFormModel } from './context';
import { FormControlGroup } from './form-ui';
import { isValidNestProps } from './helpers';

export type SettingFormObjectProps = IComponentProp;

const defaultGetVisible = () => true;

/**
 * 为该组件下的 SettingFormItem 添加一个数据字段前缀
 */
export const SettingFormObject = observer(
  ({
    title,
    tip,
    docs,
    name,
    defaultValue,
    getVisible = defaultGetVisible,
    props = [],
  }: SettingFormObjectProps) => {
    const parent = useFormModel();
    const visible = getVisible(parent);
    const subModel = parent.getSubModel(name);
    return (
      <FormModelProvider value={subModel}>
        <Box className="FormObject" display={visible ? 'block' : 'none'}>
          <FormControlGroup
            label={title}
            note={name}
            tip={tip}
            docs={docs}
            checked={!!subModel.values ?? !!defaultValue}
            onCheck={(checked) => {
              const nextValue = checked ? {} : undefined;
              parent.setValue(name, nextValue);
              parent.onChange(name, nextValue); // 非 Field 发起， 主动调一次
            }}
          >
            {props.map((prop) => {
              if (isValidNestProps(prop.props)) {
                return <SettingFormObject key={prop.name} {...prop} />;
              }
              return <SettingFormItem key={prop.name} {...prop} />;
            })}
          </FormControlGroup>
        </Box>
      </FormModelProvider>
    );
  },
);
