import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  clone,
  ComponentPropType,
  isVariableString,
  logger,
  SetterOnChangeDetailType,
  useBoolean,
} from '@music163/tango-helpers';
import { IconFont, ToggleButton } from '@music163/tango-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { InputProps, Tooltip } from 'antd';
import { INTERNAL_SETTERS } from './setters';
import { useFormModel, useFormVariable } from './context';
import { FormControl, FormControlProps } from './form-ui';

export interface FormItemProps extends ComponentPropType {
  extra?: React.ReactNode;
}

export interface FormItemComponentProps<T = any> {
  value?: T;
  onChange: (value: T, detail?: SetterOnChangeDetailType) => void;
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
   * 别名列表
   */
  alias?: string[];
  /**
   * 渲染的组件
   */
  component?: React.ComponentType<FormItemComponentProps>;
  /**
   * 自定义渲染器
   */
  render?: (args: FormItemComponentProps) => React.ReactElement;
  /**
   * 是否禁用变量设置器
   */
  disableVariableSetter?: boolean;
  /**
   * 表单项类型
   */
  type?: FormControlProps['type'];
  /**
   * 子表单是否默认折叠
   */
  defaultCollapsed?: boolean;
  /**
   * 默认的表单值校验逻辑
   */
  validate?: (value: string) => string | Promise<any>;
}

function normalizeCreateOptions(
  options: IFormItemCreateOptions,
): Required<Omit<IFormItemCreateOptions, 'component' | 'alias'>> {
  const render = options.render ?? ((props: any) => React.createElement(options.component, props));
  return {
    name: options.name,
    render,
    disableVariableSetter: options.disableVariableSetter ?? false,
    type: options.type || 'formItem',
    defaultCollapsed: options.defaultCollapsed ?? true,
    validate: options.validate,
  };
}

const defaultGetSetterProps = () => ({});
const defaultGetVisible = () => true;

export function createFormItem(options: IFormItemCreateOptions) {
  const _options = normalizeCreateOptions(options);

  function FormItem({
    name,
    title,
    tip,
    placeholder,
    docs,
    autoCompleteOptions,
    setter,
    setterProps,
    defaultValue,
    options: setterOptions,
    disableVariableSetter: disableVariableSetterProp,
    getVisible: getVisibleProp,
    getSetterProps: getSetterPropsProp,
    extra,
  }: FormItemProps) {
    const { disableSwitchExpressionSetter } = useFormVariable();
    const model = useFormModel();
    const field = model.getField(name);
    const value = toJS(field.value ?? defaultValue);
    const disableVariableSetter =
      disableSwitchExpressionSetter || disableVariableSetterProp || _options.disableVariableSetter;
    const [isVariable, { toggle: toggleIsVariable }] = useBoolean(
      () => !disableVariableSetter && isVariableString(value),
    );

    const setterName = isVariable ? 'expressionSetter' : setter;
    const validate = SETTERS_VALIDATE_DICT[setterName];
    field.setConfig({
      validate,
    });

    const baseComponentProps = clone(
      {
        value,
        defaultValue,
        onChange: field.handleChange,
        status: field.error ? 'error' : undefined,
        placeholder,
        options: setterOptions,
      },
      false,
    ) as FormItemComponentProps;

    let expProps = {};

    // FIXME: 重新考虑这段代码的位置
    if (['expressionSetter', 'actionSetter', 'eventSetter'].includes(setter) || isVariable) {
      expProps = {
        modalTitle: title,
        modalTip: tip,
        autoCompleteOptions,
      };
    }

    const getSetterProps = getSetterPropsProp || defaultGetSetterProps;
    const ExpressionSetter = SETTERS_DICT['expressionSetter'];

    const setterNode = isVariable ? (
      <ExpressionSetter {...expProps} {...baseComponentProps} />
    ) : (
      _options.render({
        ...expProps,
        ...baseComponentProps,
        ...setterProps, // setterProps 优先级大于快捷属性
        ...getSetterProps(model),
      })
    );

    const getVisible = getVisibleProp || defaultGetVisible;

    return (
      <FormControl
        visible={getVisible(model)}
        type={_options.type}
        defaultCollapsed={_options.defaultCollapsed}
        label={title}
        note={name}
        tip={tip}
        docs={docs}
        error={field.error}
        extra={
          <>
            {!disableVariableSetter ? (
              <ToggleButton
                borderRadius="s"
                size="s"
                shape="outline"
                type="primary"
                tooltip="切换为 JS 表达式"
                tooltipPlacement="left"
                selected={isVariable}
                onClick={() => toggleIsVariable()}
              >
                <IconFont type="icon-brackets-curly" />
              </ToggleButton>
            ) : null}
            {extra}
          </>
        }
        data-setter={setterName}
        data-field={name}
      >
        {setterNode}
      </FormControl>
    );
  }

  FormItem.displayName = `FormItem_${_options.name}`;

  return observer(FormItem);
}

// setter 查找表
const SETTERS_DICT: Record<string, React.FunctionComponent<any>> = {};
// setter 校验函数查找表
const SETTERS_VALIDATE_DICT: Record<string, IFormItemCreateOptions['validate']> = {};

INTERNAL_SETTERS.forEach((config) => {
  const ret = createFormItem(config);
  const names = [config.name, ...(config.alias ?? [])];
  names.forEach((name) => {
    SETTERS_DICT[name] = ret;
  });
  if (config.validate) {
    names.forEach((name) => {
      SETTERS_VALIDATE_DICT[name] = config.validate;
    });
  }
});

const iconStyle = {
  color: 'red',
};

export function SettingFormItem(props: FormItemProps) {
  const { setter } = props;
  const Comp = SETTERS_DICT[setter];
  if (Comp == null) {
    const Fallback = SETTERS_DICT.expressionSetter;
    return (
      <Fallback
        {...props}
        extra={
          <Tooltip title={`${props.name}: invalid setter ${props.setter}`}>
            <QuestionCircleOutlined color="red" style={iconStyle} />
          </Tooltip>
        }
      />
    );
  }
  return React.createElement(Comp, props);
}

/**
 * Setter 注册
 * @param options
 */
export function register(options: IFormItemCreateOptions) {
  if (SETTERS_DICT[options.name]) {
    logger.log(`Internal setter override: <${options.name}>`);
  }
  SETTERS_DICT[options.name] = createFormItem(options);
}
