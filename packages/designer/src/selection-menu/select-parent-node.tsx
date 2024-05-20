import React from 'react';
import { useWorkspace, observer } from '@music163/tango-context';
import { IconFont, SelectAction } from '@music163/tango-ui';

export const SelectParentNodeAction = observer(() => {
  const workspace = useWorkspace();

  return (
    <SelectAction
      tooltip="选中父节点"
      onClick={() => {
        workspace.selectSource.selectParent();
      }}
    >
      <IconFont type="icon-huiche1" rotate={90} />
    </SelectAction>
  );
});
