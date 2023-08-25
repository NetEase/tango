import React from 'react';
import { useWorkspace, observer } from '@music163/tango-context';
import { SelectAction } from '@music163/tango-ui';
import { CopyOutlined } from '@ant-design/icons';

export const CopyNode = observer(() => {
  const workspace = useWorkspace();
  return (
    <SelectAction
      tooltip="复制节点"
      onClick={() => {
        workspace.cloneSelectedNode();
      }}
    >
      <CopyOutlined />
    </SelectAction>
  );
});
