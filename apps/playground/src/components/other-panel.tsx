import React from 'react';
import { Row, Switch } from 'antd';
import { observer } from '@music163/tango-context';

const OtherPanel = observer(({ autoRemove, setAutoRemove }: any) => {
  const onChange = (checked: boolean) => {
    setAutoRemove(checked);
  };
  return (
    <Row>
      <label>自动移除未引用变量：</label>
      <Switch
        checkedChildren="开启"
        unCheckedChildren="关闭"
        onChange={onChange}
        checked={autoRemove}
      />
    </Row>
  );
});

export default OtherPanel;
