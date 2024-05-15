import React, { useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  clone,
  ComponentPropValidate,
  getCodeOfWrappedCode,
  IComponentProp,
  isNil,
  isString,
  isWrappedCode,
  runCode,
  wrapCode,
} from '@music163/tango-helpers';
import { ToggleButton, CodeOutlined, ErrorBoundary } from '@music163/tango-ui';
import { value2code } from '@music163/tango-core';
import { InputProps } from 'antd';
import { useFormModel, useFormVariable } from './context';
import { FormControl } from './form-ui';
import { Box, Text } from 'coral-system';
import { ISetterOnChangeCallbackDetail } from './types';

export interface FormItemProps extends IComponentProp {
  /**
   * 无样式模式，仅返回 setter 组件
   */
  noStyle?: boolean;
  /**
   * 表单项右侧自定义区域
   */
  extra?: React.ReactNode;
  /**
   * 表单项底部自定义区域
   */
  footer?: React.ReactNode;
}

export interface FormItemComponentProps<T = any> {
  value?: T;
  onChange: (value: T, detail?: ISetterOnChangeCallbackDetail) => void;
  readOnly?: boolean;
  disabled?: boolean;
  status?: InputProps['status'];
  [prop: string]: any;
}

export interface IFormItemCreateOptions {
  /**
   * 设置器调用名
   */
  name: string;
  /**
   * 设置器别名列表，支持多个名字
   */
  alias?: string[];
  /**
   * 设置器类型，value类设置器支持切换到codeSetter，默认为 value setter
   */
  type?: 'code' | 'value';
  /**
   * 渲染设置器使用的组件
   */
  component?: React.ComponentType<FormItemComponentProps>;
  /**
   * 自定义渲染器 render 函数，render 优先级高于 component
   */
  render?: (args: FormItemComponentProps) => React.ReactElement;
  /**
   * 是否禁用变量设置器
   */
  disableVariableSetter?: boolean;
  /**
   * 默认的表单值校验逻辑
   */
  validate?: ComponentPropValidate;
}

const defaultGetSetterProps = () => ({});
const defaultGetVisible = () => true;

function parseFieldValue(fieldValue: any) {
  let value: any;
  let code: string;

  if (!fieldValue) {
    return [];
  }

  const isCodeString = isString(fieldValue) && isWrappedCode(fieldValue);
  if (isCodeString) {
    code = getCodeOfWrappedCode(fieldValue);
    value = runCode(code);
  } else {
    code = value2code(fieldValue);
    value = fieldValue;
  }
  return [value, code];
}

interface UseSetterValueProps {
  fieldValue: any;
  setter: string;
  setterType: IFormItemCreateOptions['type'];
}

function useSetterValue({ fieldValue, setter, setterType }: UseSetterValueProps) {
  const [value, code] = parseFieldValue(fieldValue);
  const [isCodeSetter, setIsCodeSetter] = useState(() => {
    // 同时不存在，表示是空置
    if (!code && !value) {
      return false;
    }

    // value 解析出错的情况，使用 codeSetter
    if (isNil(value)) {
      return true;
    }
  });

  const toggleSetter = () => {
    setIsCodeSetter(!isCodeSetter);
  };

  let fixedSetter: string;
  let setterValue: any;
  if (setterType === 'code') {
    fixedSetter = setter;
    setterValue = code;
  } else {
    fixedSetter = isCodeSetter ? 'codeSetter' : setter;
    setterValue = isCodeSetter ? code : value;
  }

  return {
    setter: fixedSetter,
    setterValue, // setter value
    isCodeSetter, // 是否为 codeSetter
    toggleSetter, // 切换 setter
  };
}

export function createFormItem(options: IFormItemCreateOptions) {
  const renderSetter =
    options.render ?? ((props: any) => React.createElement(options.component, props));
  const setterType = options.type ?? 'value'; // 设置器的模式

  function getShowToggleCodeButton(disableVariableSetter = options.disableVariableSetter) {
    if (setterType === 'code') {
      // codeSetter 无需切换按钮
      return false;
    }
    // 如果用户设置了 disableVariableSetter，则不显示切换按钮
    return !disableVariableSetter;
  }

  function FormItem({
    name,
    title,
    tip,
    placeholder,
    docs,
    autoCompleteOptions,
    setter: setterProp,
    setterProps,
    defaultValue,
    options: setterOptions,
    disableVariableSetter,
    getVisible: getVisibleProp,
    getSetterProps: getSetterPropsProp,
    deprecated,
    extra,
    footer,
    noStyle,
    validate,
  }: FormItemProps) {
    const { disableSwitchExpressionSetter, showItemSubtitle } = useFormVariable();
    const model = useFormModel();
    const field = model.getField(name);

    const fieldValue = toJS(field.value ?? defaultValue);
    const { setterValue, setter, isCodeSetter, toggleSetter } = useSetterValue({
      fieldValue,
      setter: setterProp,
      setterType,
    });

    field.setConfig({
      validate: validate || options.validate,
    });

    let baseComponentProps: FormItemComponentProps = {
      value: setterValue,
      defaultValue,
      onChange(value, detail) {
        if (setterType === 'code' && isString(value) && value) {
          value = wrapCode(value);
        }
        field.handleChange(value, detail);
      },
      status: field.error ? 'error' : undefined,
      placeholder,
      options: setterOptions,
    };
    baseComponentProps = clone(baseComponentProps, false);

    let expProps = {};

    // FIXME: 重新考虑这段代码的位置，外置这个逻辑
    if (
      ['codeSetter', 'expressionSetter', 'expSetter', 'actionSetter', 'eventSetter'].includes(
        setter,
      )
    ) {
      expProps = {
        modalTitle: title,
        modalTip: tip,
        autoCompleteOptions,
      };
    }

    const getSetterProps = getSetterPropsProp || defaultGetSetterProps;
    // 从注册表中获取 expSetter
    const CodeSetter = REGISTERED_FORM_ITEM_MAP['codeSetter']?.config?.component;

    const setterNode = isCodeSetter ? (
      <CodeSetter {...expProps} {...baseComponentProps} />
    ) : (
      renderSetter({
        ...expProps,
        ...baseComponentProps,
        ...setterProps, // setterProps 优先级大于快捷属性
        ...getSetterProps(model),
      })
    );

    const getVisible = getVisibleProp || defaultGetVisible;

    if (noStyle) {
      // 无样式模式
      return getVisible(model) ? setterNode : <div data-setter={setter} data-field={name} />;
    }

    const showToggleCodeButton = getShowToggleCodeButton(
      disableSwitchExpressionSetter || disableVariableSetter,
    );

    return (
      <FormControl
        visible={getVisible(model)}
        label={title}
        note={showItemSubtitle ? name : null}
        tip={tip}
        docs={docs}
        deprecated={deprecated}
        error={field.error}
        extra={
          <Box>
            {extra}
            {showToggleCodeButton ? (
              <ToggleButton
                borderRadius="s"
                size="s"
                shape="text"
                type="primary"
                tooltip={isCodeSetter ? '关闭 JS 表达式' : '使用 JS 表达式'}
                tooltipPlacement="left"
                selected={isCodeSetter}
                onClick={() => toggleSetter()}
              >
                <CodeOutlined />
              </ToggleButton>
            ) : null}
          </Box>
        }
        footer={footer}
        data-setter={setter}
        data-field={name}
      >
        <ErrorBoundary>{setterNode}</ErrorBoundary>
      </FormControl>
    );
  }

  FormItem.displayName = `FormItem_${options.name}`;
  FormItem.config = options;

  return observer(FormItem);
}

// 已注册的 setter 查找表
const REGISTERED_FORM_ITEM_MAP: Record<string, ReturnType<typeof createFormItem>> = {};

/**
 * Setter 注册
 * @param config 注册选项
 */
export function register(config: IFormItemCreateOptions) {
  REGISTERED_FORM_ITEM_MAP[config.name] = createFormItem(config);
  (Array.isArray(config.alias) ? config.alias : []).forEach((alias) => {
    REGISTERED_FORM_ITEM_MAP[alias] = REGISTERED_FORM_ITEM_MAP[config.name];
  });
}

export function SettingFormItem(props: FormItemProps) {
  const { setter } = props;
  const Comp = REGISTERED_FORM_ITEM_MAP[setter];
  if (Comp == null) {
    const Fallback = REGISTERED_FORM_ITEM_MAP.codeSetter;
    return (
      <Fallback
        {...props}
        footer={
          <Text color="red" mt="m">
            {props.setter} is invalid
          </Text>
        }
      />
    );
  }
  return React.createElement(Comp, props);
}
