import React from 'react';
import { Button, Space } from 'antd';
import { useBoolean } from '@music163/tango-helpers';
import { Panel, Form, IconButton } from '@music163/tango-ui';
import { FileAddOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { observer, useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { EditableVariableTree, EditableVariableTreeProps } from '../components';

export interface VariablePanelProps extends EditableVariableTreeProps {
  wrapperHeight?: number | string;
}

export const VariablePanel = observer(
  ({ wrapperHeight = '100%', ...restProps }: VariablePanelProps) => {
    const [isAdd, { on, off }] = useBoolean();
    const workspace = useWorkspace();
    const { storeVariables } = useWorkspaceData();
    const storeNames = storeVariables.map((item) => item.title);

    return (
      <Panel
        shape="solid"
        className="ModelView"
        height={wrapperHeight}
        title="视图模型与变量管理"
        subTitle={
          <IconButton
            tooltip="如何使用"
            icon={<QuestionCircleOutlined />}
            href="https://music-doc.st.netease.com/st/tango-docs/docs/guide/basic/model"
          />
        }
        extra={
          <Button size="small" type="text" icon={<FileAddOutlined />} onClick={on}>
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
              workspace.addStoreModule(values.name, emptyStoreTemplate);
              off();
            }}
          />
        ) : (
          <EditableVariableTree
            modes={['add', 'define']}
            defaultMode="define"
            dataSource={storeVariables}
            onAddVariable={(storeName, data) => {
              workspace.addStoreState(storeName, data.name, data.initialValue);
            }}
            onDeleteVariable={(storeName, stateName) => {
              workspace.removeStoreState(storeName, stateName);
            }}
            onDeleteStore={(storeName) => {
              workspace.removeStoreModule(storeName);
            }}
            onSave={(code, node) => {
              workspace.updateModuleCodeByVariablePath(node.key, code);
            }}
            height="100%"
            {...restProps}
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
    <Panel title="添加模型" subTitle="模型可以用来组织一组变量">
      <Form
        autoComplete="off"
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
          component="input"
          componentProps={{
            placeholder: '请输入模型名称',
          }}
        />
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

const emptyStoreTemplate = `
import { defineStore } from '@music163/tango-boot';
export default defineStore({
});
`;
