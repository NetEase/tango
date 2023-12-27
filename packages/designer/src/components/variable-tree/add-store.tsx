import React from 'react';
import { IVariableTreeNode } from '../variable-tree-modal';
import { Button, Form, Input, Space } from 'antd';
import { isValidExpressionCode } from '@music163/tango-core';
import { InputCode, Panel } from '@music163/tango-ui';

export interface AddStoreVariableFormProps {
  parentNode: IVariableTreeNode;
  onCancel?: React.MouseEventHandler<HTMLButtonElement>;
  onSubmit?: (storeName: string, data: { name: string; initialValue: string }) => void;
}

export function AddStoreVariableForm({
  parentNode,
  onCancel,
  onSubmit,
}: AddStoreVariableFormProps) {
  return (
    <Form
      layout="vertical"
      autoComplete="off"
      validateTrigger="onBlur"
      onFinish={(values) => {
        if (onSubmit && parentNode) {
          const [type, storeName] = parentNode.key.split('.');
          onSubmit(storeName, values);
        }
      }}
    >
      <Form.Item label="所属模型">
        <Input value={parentNode?.key} disabled />
      </Form.Item>
      <Form.Item
        label="变量名"
        name="name"
        rules={[
          { required: true },
          { pattern: /^\w+$/, message: '非法的变量标识符' },
          {
            validator(_, value) {
              const found = parentNode.children.find((item) => item.title === value);
              return found
                ? Promise.reject(new Error('和已有变量名冲突，请换一个名字！'))
                : Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="请输入变量名" />
      </Form.Item>
      <Form.Item
        label="初值"
        name="initialValue"
        rules={[
          { required: true },
          {
            validator(_, value) {
              return value && isValidExpressionCode(value)
                ? Promise.resolve()
                : Promise.reject(new Error('代码存在语法错误，请输入合法的代码片段！'));
            },
          },
        ]}
      >
        <InputCode shape="inset" placeholder="请输入初值" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export interface AddStoreFormProps {
  storeNames?: string[];
  onCancel?: () => void;
  onSubmit?: (data: { name: string }) => void;
}

export function AddStoreForm({ storeNames = [], onCancel, onSubmit }: AddStoreFormProps) {
  return (
    <Panel title="添加模型" subTitle="模型可以用来组织一组变量" bodyProps={{ p: 'l' }}>
      <Form
        autoComplete="off"
        colon={false}
        onFinish={(values) => {
          onSubmit && onSubmit(values);
        }}
      >
        <Form.Item
          label="模型名称"
          name="name"
          rules={[
            { required: true },
            { pattern: /^[a-z]\w+$/, message: '非法的变量标识符' },
            {
              validator(_, value) {
                const found = storeNames.includes(value);
                return found
                  ? Promise.reject(new Error('已存在该模型名，请换一个！'))
                  : Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="请输入模型名称" />
        </Form.Item>
        <Form.Item label=" ">
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Panel>
  );
}
