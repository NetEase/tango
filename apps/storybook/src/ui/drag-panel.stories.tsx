import React from 'react';
import { DragPanel } from '@music163/tango-ui';
import { Box, Text } from 'coral-system';
import { Button } from 'antd';

export default {
  title: 'UI/DragPanel',
};

export function Basic() {
  return (
    <DragPanel
      title="弹层标题"
      extra="右上角内容"
      width={350}
      body={<Box p="m">内容</Box>}
      footer={<Text>底部信息</Text>}
    >
      <Button>点击唤起浮层</Button>
    </DragPanel>
  );
}

export function FooterCustom() {
  return (
    <DragPanel
      title="弹层标题"
      extra="右上角内容"
      width={350}
      body={<Box p="m">内容</Box>}
      footer={(close) => (
        <Box display="flex" justifyContent="space-between">
          <Text>底部信息</Text>
          <Button size="small" onClick={() => close()}>
            点此关闭
          </Button>
        </Box>
      )}
    >
      <Button>点击唤起浮层</Button>
    </DragPanel>
  );
}
