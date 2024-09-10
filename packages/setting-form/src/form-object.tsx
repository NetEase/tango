import React from 'react';
import { Box } from 'coral-system';
import { observer } from 'mobx-react-lite';
import { IComponentProp, isString, wrapCode } from '@music163/tango-helpers';
import { SettingFormItem, useSetterValue } from './form-item';
import { FormModelProvider, useFormModel } from './context';
import { FormControlGroup, ToggleCodeButton } from './form-ui';
import { isValidNestProps } from './helpers';
import { CodeSetter } from './setters';

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
    const subModelValue = subModel.values || defaultValue;
    const forceCodeSetter = isString(subModelValue);
    const { setterValue, isCodeSetter, toggleSetter } = useSetterValue({
      fieldValue: subModelValue,
      forceCodeSetter, // TODO: 最好是在内部 code2value 失败，而不是在这里强制设置
    });
    return (
      <FormModelProvider value={subModel}>
        <Box className="FormObject" display={visible ? 'block' : 'none'}>
          <FormControlGroup
            label={title}
            note={name}
            tip={tip}
            docs={docs}
            checked={!!subModel.values || !!defaultValue}
            onCheck={(checked) => {
              const nextValue = checked ? {} : undefined;
              parent.setValue(name, nextValue);
              parent.onChange(name, nextValue); // 非 Field 发起， 主动调一次
            }}
            extra={
              <ToggleCodeButton
                confirm={forceCodeSetter}
                selected={isCodeSetter}
                onToggle={toggleSetter}
              />
            }
          >
            {isCodeSetter ? (
              <CodeSetter
                value={setterValue}
                onChange={(val) => {
                  const nextVal = val ? wrapCode(val) : undefined;
                  parent.setValue(name, nextVal);
                  parent.onChange(name, nextVal); // 非 Field 发起， 主动调一次
                }}
              />
            ) : (
              props.map((prop) => {
                if (isValidNestProps(prop.props)) {
                  return <SettingFormObject key={prop.name} {...prop} />;
                }
                return <SettingFormItem key={prop.name} {...prop} />;
              })
            )}
          </FormControlGroup>
        </Box>
      </FormModelProvider>
    );
  },
);
