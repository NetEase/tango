import React from 'react';
import { observer, useDesigner } from '@music163/tango-context';
import { SelectAction } from '@music163/tango-ui';
import { AimOutlined } from '@ant-design/icons';

export const ViewSource = observer(() => {
  const designer = useDesigner();
  return (
    <SelectAction
      tooltip="查看源码"
      onClick={() => {
        designer.setActiveView('code');
      }}
    >
      <AimOutlined />
    </SelectAction>
  );
});
