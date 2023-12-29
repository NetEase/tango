import { isValidFunctionCode, url2serviceName } from '@music163/tango-helpers';
import { InputCode } from '@music163/tango-ui';
import { Button, Dropdown, Form, FormProps, Input, Select, Space } from 'antd';
import { Box } from 'coral-system';
import React, { useState } from 'react';

interface AddServiceFormProps extends FormProps {
  initialValues?: object;
  onSubmit: (values: object) => void;
  onCancel: () => void;
  serviceModules: object[];
  serviceNames: string[];
}

export function AddServiceForm({
  initialValues,
  onSubmit,
  onCancel,
  serviceModules,
  serviceNames,
  ...formProps
}: AddServiceFormProps) {
  const isModifyMode = !!initialValues?.['name']; // 是否为更新模式
  const [disabled, setDisabled] = useState(isModifyMode);
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 17 }}
      colon={false}
      layout="horizontal"
      initialValues={initialValues}
      onFinish={(values) => {
        onSubmit(values);
      }}
      {...formProps}
    >
      <Form.Item
        label="命名空间"
        name="moduleName"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select options={serviceModules} disabled={disabled || isModifyMode} />
      </Form.Item>
      <Form.Item
        label="方法名"
        name="name"
        rules={[
          { required: true },
          { pattern: /^[a-z]\w+$/, message: '请输入合法的方法名称' },
          !isModifyMode && {
            validator(_, value) {
              const isExist = serviceNames.includes(value);
              return isExist
                ? Promise.reject(new Error('重复的方法名，请换一个！'))
                : Promise.resolve();
            },
          },
        ]}
        extra={
          !disabled && (
            <Box>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  const url = form.getFieldValue('url');
                  if (!url) {
                    return;
                  }

                  const funcName = url2serviceName(url);
                  form.setFieldValue('name', funcName);
                }}
              >
                基于接口路径自动生成
              </Button>
            </Box>
          )
        }
      >
        <Input placeholder="请输入数据服务调用名称" disabled={disabled || isModifyMode} />
      </Form.Item>
      <Form.Item label="路径" name="url" rules={[{ required: true, type: 'url' }]}>
        <Input placeholder="请输入数据服务调用名称" disabled={disabled || isModifyMode} />
      </Form.Item>
      <Form.Item label="方法" name="method">
        <Select
          options={[
            { label: 'GET', value: 'get' },
            { label: 'POST', value: 'post' },
          ]}
          placeholder="请选择 HTTP 请求方法"
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item
        label="格式化响应"
        name="formatter"
        tooltip="提供格式化函数，对结果进行格式化"
        validateTrigger="onBlur"
        rules={[
          {
            validator(_, value) {
              if (!value) {
                return Promise.resolve();
              }

              return isValidFunctionCode(value)
                ? Promise.resolve()
                : Promise.reject(new Error('请提供合法的函数代码！'));
            },
          },
        ]}
        extra={
          !disabled && (
            <Box>
              <Dropdown
                menu={{
                  items: [
                    { label: '直接返回（默认）', key: 'res => res' },
                    { label: '返回数据部分（云音乐标准规范）', key: 'res => res.data' },
                  ],
                  onClick: ({ key }) => {
                    form.setFieldValue('formatter', key);
                  },
                }}
              >
                <Button type="link" size="small">
                  使用模板函数
                </Button>
              </Dropdown>
            </Box>
          )
        }
      >
        <InputCode showLineNumbers placeholder="res => res" editable={!disabled} />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        {isModifyMode ? (
          <Space>
            {!disabled ? (
              <>
                <Button
                  onClick={() => {
                    setDisabled(true);
                  }}
                >
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  修改
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setDisabled(false);
                }}
              >
                编辑
              </Button>
            )}
          </Space>
        ) : (
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Space>
        )}
      </Form.Item>
    </Form>
  );
}
