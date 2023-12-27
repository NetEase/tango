import React from 'react';
import { Button, Space, Form, Input } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import { useBoolean } from '@music163/tango-helpers';
import { Panel } from '@music163/tango-ui';
import { observer, useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { VariableTree } from '../components';
import { CODE_TEMPLATES } from '../helpers';

export interface VariablePanelProps {
  wrapperHeight?: number | string;
  newStoreTemplate?: string;
}

export const VariablePanel = observer(
  ({
    wrapperHeight = '100%',
    newStoreTemplate = CODE_TEMPLATES.newStoreTemplate,
  }: VariablePanelProps) => {
    const [isAdd, { on, off }] = useBoolean();
    const workspace = useWorkspace();
    const { storeVariables } = useWorkspaceData();
    const storeNames = storeVariables.map((item) => item.title) as string[];

    return (
      <Panel
        className="ModelView"
        height={wrapperHeight}
        title="视图模型与变量管理"
        extra={
          <Button size="small" type="primary" icon={<FileAddOutlined />} onClick={on}>
            新建模型
          </Button>
        }
        bodyProps={{ p: 0 }}
      >
        {isAdd ? (
          <AddStoreForm
            existNames={storeNames}
            onCancel={off}
            onSubmit={(values) => {
              workspace.addStoreFile(values.name, newStoreTemplate);
              off();
            }}
          />
        ) : (
          <VariableTree
            showViewIcon={false}
            dataSource={storeVariables}
            onAddStoreVariable={(storeName, data) => {
              workspace.addStoreState(storeName, data.name, data.initialValue);
            }}
            onRemoveVariable={(variableKey) => {
              const [, storeName, stateName] = variableKey.split('.');
              workspace.removeStoreState(storeName, stateName);
            }}
            onUpdateVariable={(variableKey, code) => {
              workspace.updateStoreVariable(variableKey, code);
            }}
          />
        )}
      </Panel>
    );
  },
);

interface AddStoreFormProps {
  existNames?: string[];
  onCancel?: () => void;
  onSubmit?: (data: { name: string }) => void;
}

function AddStoreForm({ existNames = [], onCancel, onSubmit }: AddStoreFormProps) {
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
                const found = existNames.includes(value);
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
