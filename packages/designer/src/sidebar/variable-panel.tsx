import React from 'react';
import { Button } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import { useBoolean } from '@music163/tango-helpers';
import { Panel } from '@music163/tango-ui';
import { observer, useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { VariableTree } from '../components';
import { CODE_TEMPLATES } from '../helpers';
import { AddStoreForm } from '../components/variable-tree/add-store';

export interface VariablePanelProps {
  newStoreTemplate?: string;
}

export const VariablePanel = observer(
  ({ newStoreTemplate = CODE_TEMPLATES.newStoreTemplate }: VariablePanelProps) => {
    const [isAdd, { on, off }] = useBoolean();
    const workspace = useWorkspace();
    const { storeVariables } = useWorkspaceData();
    const storeNames = storeVariables.map((item) => item.title) as string[];

    return (
      <Panel
        className="ModelView"
        height="100%"
        title="视图模型与变量管理"
        extra={
          <Button size="small" type="primary" icon={<FileAddOutlined />} onClick={on}>
            新建模型
          </Button>
        }
        bodyProps={{ p: 'm', height: '100%' }}
      >
        {isAdd ? (
          <AddStoreForm
            storeNames={storeNames}
            onCancel={off}
            onSubmit={(values) => {
              workspace.addStoreFile(values.name, newStoreTemplate);
              off();
            }}
          />
        ) : (
          <VariableTree
            height="100%"
            defaultValueDetailMode="define"
            dataSource={storeVariables}
            onAddStoreVariable={(storeName, data) => {
              workspace.addStoreState(storeName, data.name, data.initialValue);
            }}
            onRemoveStoreVariable={(variableKey) => {
              workspace.removeStoreVariable(variableKey);
            }}
            onUpdateStoreVariable={(variableKey, code) => {
              workspace.updateStoreVariable(variableKey, code);
            }}
          />
        )}
      </Panel>
    );
  },
);
