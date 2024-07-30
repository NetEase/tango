import React from 'react';
import { ToggleButton } from '@music163/tango-ui';
import { EyeOutlined } from '@ant-design/icons';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';

export const PreviewTool = observer(() => {
  const designer = useDesigner();
  const workspace = useWorkspace();

  return (
    <ToggleButton
      disabled={!workspace.isValid}
      shape="ghost"
      selected={designer.isPreview}
      onClick={() => {
        const nextIsPreview = !designer.isPreview;
        designer.toggleIsPreview(nextIsPreview);
        if (nextIsPreview && designer.activeView === 'code') {
          designer.setActiveView('design');
        }
      }}
      tooltip={designer.isPreview ? '切换到设计模式' : '切换到预览模式'}
    >
      <EyeOutlined />
    </ToggleButton>
  );
});
