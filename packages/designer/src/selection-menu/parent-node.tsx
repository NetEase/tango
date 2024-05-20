import React from 'react';
import { useWorkspace, observer } from '@music163/tango-context';
import { SelectAction } from '@music163/tango-ui';
import { EnterOutlined } from '@ant-design/icons';

export const ParentNodeAction = observer(() => {
  const workspace = useWorkspace();

  return (
    <SelectAction
      tooltip="选中父节点"
      onClick={() => {
        workspace.selectParentNode();
      }}
    >
      <EnterOutlined rotate={90} />
    </SelectAction>
  );
});
