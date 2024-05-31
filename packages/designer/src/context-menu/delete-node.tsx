import React from 'react';
import { useWorkspace, observer } from '@music163/tango-context';
import { ContextAction } from '@music163/tango-ui';
import { DeleteOutlined } from '@ant-design/icons';

export const DeleteNodeContextAction = observer(() => {
  const workspace = useWorkspace();
  return (
    <ContextAction
      icon={<DeleteOutlined />}
      hotkey="Backspace"
      onClick={() => {
        workspace.removeSelectedNode();
      }}
    >
      删除节点
    </ContextAction>
  );
});
