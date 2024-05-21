import React from 'react';
import { useDesigner, observer } from '@music163/tango-context';
import { ContextAction } from '@music163/tango-ui';
import { CodeOutlined } from '@ant-design/icons';

export const ViewSourceContextAction = observer(() => {
  const designer = useDesigner();
  return (
    <ContextAction
      icon={<CodeOutlined />}
      onClick={() => {
        designer.setActiveView('code');
      }}
    >
      查看源码
    </ContextAction>
  );
});
