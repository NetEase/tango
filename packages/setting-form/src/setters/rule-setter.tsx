import React from 'react';
import { Box } from 'coral-system';
import { AutoComplete, Button, Select, Switch } from 'antd';
import { FieldStringOutlined } from '@ant-design/icons';
import { SingleMonacoEditor } from '@music163/tango-ui';
import { FormItemComponentProps } from '../form-item';
import { ListSetter, NewOptionFormFieldType } from './list-setter';

// 常用正则
const enumPattern = [
  {
    label: '纯数字',
    value: '^[0-9]*$',
  },
  {
    label: '纯汉字',
    value: '^[\u4e00-\u9fa5]{0,}$',
  },
  {
    label: '手机号',
    value: '^[1][3-8][0-9]{9}$',
  },
  {
    label: 'IP地址',
    value: 'd+.d+.d+.d+',
  },
  {
    label: '身份证号',
    value: '^d{15}|d{18}$',
  },
  {
    label: '邮政编码',
    value: '[1-9]d{5}(?!d)',
  },
  {
    label: '图片URL',
    value: '(https?:[^:<>"]*/)([^:<>"]*)(.((png!thumbnail)|(png)|(jpg)|(webp)|(gif)))',
  },
];

// async-validator type
// https://github.com/yiminghe/async-validator#type
const type = [
  'string', // // Must be of type string. This is the default type.
  // 'number', Input TextArea出来的value都是string / InputNumber是number。不在async-validator做数字类型的校验
  'boolean', // Must be of type boolean.
  'regexp', // Must be an instance of RegExp or a string that does not generate an exception when creating a new RegExp.
  'integer', // Must be of type number and an integer.
  'float', // Must be of type number and a floating point number.
  'array', // Must be an array as determined by Array.isArray.
  'object', // Must be of type object and not Array.isArray.
  'date', // Value // Must be valid as determined by Date
  'url', // Must be of type url.
  'email', // Must be of type email.
];

const trigger = ['change', 'submit'];

const status = ['error', 'warning'];

/**
 * 正则输入框
 */
const PatternInput: React.FunctionComponent<any> = (props) => {
  return (
    <>
      <AutoComplete options={enumPattern} onSelect={props.onChange} {...props} />
    </>
  );
};

/**
 * 必填选择
 */
const RequiredInput: React.FunctionComponent<any> = (props) => {
  return (
    <>
      <Switch onChange={props.onChange} checked={props.value} {...props} />
    </>
  );
};

const optionFormFields: NewOptionFormFieldType[] = [
  {
    label: '字段类型',
    name: 'type',
    required: true,
    component: <Select options={type.map((t) => ({ label: t, value: t }))} />,
  },
  {
    label: '是否必填',
    name: 'required',
    component: <RequiredInput />,
  },
  {
    label: '触发方式',
    name: 'trigger',
    component: <Select options={trigger.map((t) => ({ label: t, value: t }))} />,
  },
  {
    label: '触发状态',
    name: 'status',
    component: <Select options={status.map((t) => ({ label: t, value: t }))} />,
  },
  {
    label: '错误提示语',
    name: 'message',
    extra: '自定义错误提示',
  },
  {
    label: '正则表达式',
    name: 'pattern',
    extra: '复杂场景，可以自定义正则。',
    component: <PatternInput placeholder="例如: ^[0-9]*$" />,
  },
  {
    label: '自定义校验',
    name: 'validator',
    width: '400px',
    extra: (
      <Button
        type="link"
        onClick={() => window.open('https://github.com/yiminghe/async-validator#validator')}
      >
        文档地址
      </Button>
    ),
    component: (
      <SingleMonacoEditor
        hasBorder
        height="108px"
        defaultValue="/** {(rule, value, callback) => { return value === 'test';}}*/"
        options={{
          lineNumbers: 'off',
          fontSize: 12,
          wordWrap: 'on',
          minimap: {
            enabled: false,
          },
        }}
      />
    ),
  },
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
 * 校验属性配置
 */
export function RuleSetter(props: FormItemComponentProps<any[]>) {
  return (
    <ListSetter
      getListItemKey={(item) => item.key || item.dataIndex}
      addBtnText="配置校验器"
      listItemFormFields={optionFormFields}
      newItemDefaultValues={{
        type: 'string',
        trigger: 'change',
        status: 'error',
      }}
      renderItem={renderSetterItem}
      {...props}
    />
  );
}
