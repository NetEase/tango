import React, { FunctionComponent, useState } from 'react';
import { Box } from 'coral-system';
import { Select, Input, Tabs, Button } from 'antd';
import { FieldStringOutlined } from '@ant-design/icons';
import { SingleMonacoEditor } from '@music163/tango-ui';
import { FormItemComponentProps } from '../form-item';
import { useFormVariable } from '../context';
import { ListSetter } from './list-setter';

const { TabPane } = Tabs;

// TODO: 需考虑 option选项联动 & 组件属性联动等面板
const CustomComponent: FunctionComponent<any> = ({ value = {}, onChange }) => {
  // FIXME: 这里之前判断逻辑有问题，导致每次 value 变更都执行 parseExpression
  const [tabIndex, setTabIndex] = useState(typeof value === 'string' ? '2' : '1');

  const triggerChange = (changedValue: any) => {
    onChange({
      ...value,
      ...changedValue,
    });
  };

  const customListenerDefaultValue = `/* {(valid, field, form) => {
    form.fieldMap.input1.setValue("联动改变值");
  }}*/`;
  return (
    <Tabs type="card" activeKey={tabIndex} onChange={setTabIndex}>
      <TabPane tab="常用配置" key="1">
        <Box display="flex" flexDirection="column" gap="20px">
          <Select
            value={value?.status}
            onChange={(v) => {
              triggerChange({
                status: v,
              });
            }}
            placeholder="UI状态"
            options={[
              {
                label: '编辑',
                value: 'edit',
              },
              {
                label: '禁用',
                value: 'disabled',
              },
              {
                label: '隐藏',
                value: 'hidden',
              },
              {
                label: '预览',
                value: 'preview',
              },
            ]}
          />
          <Select
            value={value?.ui?.required}
            onChange={(v) => {
              triggerChange({
                ui: {
                  ...value?.ui,
                  required: v,
                },
              });
            }}
            placeholder="必填"
            options={[
              {
                label: '必填',
                value: true,
              },
              {
                label: '不必填',
                value: false,
              },
            ]}
          />
          <Input
            placeholder="设置label标题"
            value={value?.ui?.label}
            onChange={(e) => {
              triggerChange({
                ui: {
                  ...value?.ui,
                  label: e.target.value,
                },
              });
            }}
          />
          <Input
            placeholder="设置字段值"
            value={value?.value}
            onChange={(e) => {
              triggerChange({
                value: e.target.value,
              });
            }}
          />
        </Box>
      </TabPane>
      <TabPane tab="自定义配置" key="2">
        <SingleMonacoEditor
          defaultValue={customListenerDefaultValue}
          value={
            Object.prototype.toString.call(value) === '[object Object]'
              ? customListenerDefaultValue
              : value
          }
          onChange={(v) => onChange(v.trim())}
          hasBorder
          height="150px"
          options={{
            lineNumbers: 'off',
            fontSize: 12,
            wordWrap: 'on',
            minimap: {
              enabled: false,
            },
          }}
        />
      </TabPane>
    </Tabs>
  );
};

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
 * XFormItem响应器
 */
export const ListenerSetter = (props: FormItemComponentProps<any[]>) => {
  const { formFieldsOptions } = useFormVariable();

  return (
    <ListSetter
      getListItemKey={(item) => item.key || item.dataIndex}
      addBtnText="配置响应器"
      listItemFormFields={[
        {
          label: '来源字段',
          name: 'watch',
          required: true,
          component: <Select mode="tags" options={formFieldsOptions} />,
          extra: <span>请选择依赖的字段。</span>,
        },
        {
          label: '触发条件',
          name: 'condition',
          required: true,
          component: (
            <SingleMonacoEditor
              hasBorder
              height="50px"
              defaultValue="// input1.value === '123'"
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
          extra: <span>请输入一个布尔表达式，满足条件时即触发响应。</span>,
        },
        {
          label: '响应行为',
          name: 'set',
          required: true,
          component: <CustomComponent />,
          width: '400px',
          extra: (
            <Button
              type="link"
              onClick={() =>
                window.open(
                  'https://music-cms.hz.netease.com/xform-docs/docs/tutorial-basics/listeners#set-%E4%B8%BA-function',
                )
              }
            >
              文档地址
            </Button>
          ),
        },
      ]}
      newItemDefaultValues={[]}
      renderItem={renderSetterItem}
      {...props}
    />
  );
};
