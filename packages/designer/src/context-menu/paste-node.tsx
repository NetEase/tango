import React from 'react';
import { useWorkspace, observer } from '@music163/tango-context';
import { ContextAction } from '@music163/tango-ui';
import { SnippetsOutlined } from '@ant-design/icons';

export const PasteNodeContextAction = observer(() => {
  const workspace = useWorkspace();
  return (
    <ContextAction
      icon={<SnippetsOutlined />}
      hotkey="Command+V"
      onClick={() => {
        workspace.pasteSelectedNode();
      }}
    >
      粘贴节点
    </ContextAction>
  );
});
