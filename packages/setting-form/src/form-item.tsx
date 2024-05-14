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
    code = fieldValue;
    const innerCode = getCodeOfWrappedCode(code);
    value = runCode(innerCode);
  } else {
    const innerCode = value2code(fieldValue);
    code = innerCode ? wrapCode(innerCode) : '';
    value = fieldValue;
  }
  return [value, code];
}

interface UseSetterValueProps {
  fieldValue: any;
  setter: string;
}

function useSetterValue({ fieldValue, setter }: UseSetterValueProps) {
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

  return {
    setterValue: isCodeSetter ? code : value,
    value,
    code,
    setter: isCodeSetter ? 'expressionSetter' : setter,
    isCodeSetter,
    toggleSetter,
  };
}

export function createFormItem(options: IFormItemCreateOptions) {
  const renderSetter =
    options.render ?? ((props: any) => React.createElement(options.component, props));

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
    disableVariableSetter: disableVariableSetterProp = options.disableVariableSetter,
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
    });

    const disableVariableSetter = disableSwitchExpressionSetter ?? disableVariableSetterProp; // Form 的设置优先

    field.setConfig({
      validate: validate || options.validate,
    });

    const baseComponentProps = clone(
      {
        value: setterValue,
        defaultValue,
        onChange: field.handleChange,
        status: field.error ? 'error' : undefined,
        placeholder,
        options: setterOptions,
      },
      false,
    ) as FormItemComponentProps;

    let expProps = {};

    // FIXME: 重新考虑这段代码的位置，外置这个逻辑
    if (
      ['expressionSetter', 'expSetter', 'actionSetter', 'eventSetter'].includes(setter) ||
      isCodeSetter
    ) {
      expProps = {
        modalTitle: title,
        modalTip: tip,
        autoCompleteOptions,
      };
    }

    const getSetterProps = getSetterPropsProp || defaultGetSetterProps;
    // 从注册表中获取 expSetter
    const ExpressionSetter = REGISTERED_FORM_ITEM_MAP['expressionSetter']?.config?.component;

    const setterNode = isCodeSetter ? (
      <ExpressionSetter {...expProps} {...baseComponentProps} />
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
            {!disableVariableSetter ? (
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
  const names = [config.name, ...(config.alias ?? [])];
  names.forEach((name) => {
    REGISTERED_FORM_ITEM_MAP[name] = createFormItem(config);
  });
}

export function SettingFormItem(props: FormItemProps) {
  const { setter } = props;
  const Comp = REGISTERED_FORM_ITEM_MAP[setter];
  if (Comp == null) {
    const Fallback = REGISTERED_FORM_ITEM_MAP.expressionSetter;
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
