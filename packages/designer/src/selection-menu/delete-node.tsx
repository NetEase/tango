import React from 'react';
import { useWorkspace, observer } from '@music163/tango-context';
import { SelectAction } from '@music163/tango-ui';
import { DeleteOutlined } from '@ant-design/icons';

export const DeleteNodeAction = observer(() => {
  const workspace = useWorkspace();
  return (
    <SelectAction
      tooltip="删除节点"
      onClick={() => {
        workspace.removeSelectedNode();
      }}
    >
      <DeleteOutlined />
    </SelectAction>
  );
});
