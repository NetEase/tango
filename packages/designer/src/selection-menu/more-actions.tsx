import React from 'react';
import { observer } from '@music163/tango-context';
import { SelectAction } from '@music163/tango-ui';
import { MoreOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { ContextMenu } from '../components';

export const MoreActionsAction = observer(() => {
  return (
    <Dropdown placement="bottomRight" overlay={<ContextMenu showParents />}>
      <SelectAction tooltip="更多">
        <MoreOutlined />
      </SelectAction>
    </Dropdown>
  );
});
