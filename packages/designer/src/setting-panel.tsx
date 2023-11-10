import React from 'react';
import { Box } from 'coral-system';
import { SettingForm, FormModel, SettingFormProps } from '@music163/tango-setting-form';
import { Panel } from '@music163/tango-ui';
import { clone } from '@music163/tango-helpers';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import './setters';

export interface SettingPanelProps extends SettingFormProps {
  title?: React.ReactNode;
}

const headerProps = {
  fontSize: '18px',
};

export const SettingPanel = observer(({ title = '设置面板', ...props }: SettingPanelProps) => {
  const workspace = useWorkspace();
  const designer = useDesigner();

  if (!designer.showRightPanel) {
    return <Box className="SettingPanel" />;
  }

  let display = 'flex';
  if (designer.activeView !== 'design' || designer.isPreview) {
    display = 'none';
  }

  const getSettingValue = (attributes: Record<string, string>) => {
    const ret = {};
    const keys = Object.keys(attributes);
    for (const key of keys) {
      if (/^data-/.test(key)) {
        continue;
      }
      ret[key] = attributes[key];
    }
    return ret;
  };

  const formValue = getSettingValue(workspace.selectSource.firstNode?.props || {});
  const formModel = new FormModel(formValue, {
    onChange(name, value, field) {
      if (!name) {
        return;
      }

      let firstName = name;
      let realValue = value;

      const namePaths = name.split('.');
      if (namePaths.length > 1) {
        firstName = namePaths[0];
        realValue = clone(formModel.getValue(firstName), false);
        if (!Object.keys(realValue).length) {
          realValue = undefined;
        }
      }

      if (!field) {
        // 针对 Form.Object 清空的情况
        workspace.updateSelectedNodeAttributes({
          [firstName]: realValue,
        });
      } else if (!field.error) {
        // 针对 Form.Item 变化的情况
        workspace.updateSelectedNodeAttributes(
          { [firstName]: realValue },
          field.detail?.relatedImports,
        );
      }
    },
  });

  const prototype = workspace.getSelectedNodePrototype();

  return (
    <Panel
      title={prototype?.title || title}
      display={display}
      flexDirection="column"
      width="320px"
      borderLeft="solid"
      borderLeftColor="line2"
      bg="white"
      headerProps={headerProps}
      className="SettingPanel"
    >
      {workspace.selectSource.isSelected ? (
        prototype ? (
          <SettingForm
            key={workspace.selectSource.first.id}
            model={formModel}
            prototype={prototype}
            {...props}
          />
        ) : (
          <Box p="m">该节点没有可配置信息</Box>
        )
      ) : (
        <Box p="m">请先选择一个节点</Box>
      )}
    </Panel>
  );
});
