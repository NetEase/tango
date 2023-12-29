import React from 'react';
import { Box } from 'coral-system';
import { Tabs } from '@music163/tango-ui';
import InterfaceConfig from './interface-config';
import ProxyConfig from './proxy-config';

export function DataSourcePanel(props: Record<string, any>) {
  return (
    <Box className="DataSourceView" height="100%" overflowY="auto">
      <Tabs
        size="small"
        isTabBarSticky
        // 切换 tab 时销毁其他 tab，以解决添加数据源后，接口服务函数内的应用不会更新的问题
        destroyInactiveTabPane
        items={[
          {
            key: 'interface',
            label: '服务函数',
            children: <InterfaceConfig {...props} />,
          },
          {
            key: 'proxy',
            label: '代理',
            children: <ProxyConfig />,
          },
        ]}
      />
    </Box>
  );
}
