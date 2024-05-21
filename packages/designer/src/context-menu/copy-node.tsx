import React from 'react';
import { useWorkspace, observer } from '@music163/tango-context';
import { ContextAction } from '@music163/tango-ui';
import { CopyOutlined } from '@ant-design/icons';

export const CopyNodeContextAction = observer(() => {
  const workspace = useWorkspace();
  return (
    <ContextAction
      icon={<CopyOutlined />}
      hotkey="Ctrl+C"
      onClick={() => {
        workspace.copySelectedNode();
      }}
    >
      复制节点
    </ContextAction>
  );
});
