import React from 'react';
import { Box } from 'coral-system';
import { Alert, Button } from 'antd';
import { Tabs } from '@music163/tango-ui';
import CommonConfig from './common-config';
import DependencyConfig, { DependencyConfigProps } from './dependency-config';
import { useDesigner } from '@music163/tango-context';

export interface SettingViewProps {
  dependencyConfig?: DependencyConfigProps;
}

export function SettingView({ dependencyConfig }: SettingViewProps) {
  const designer = useDesigner();
  return (
    <Box className="SettingView" overflowY="auto">
      <Tabs
        size="small"
        isTabBarSticky
        items={[
          {
            key: 'deps',
            label: '依赖',
            children: <DependencyConfig {...dependencyConfig} />,
          },
          {
            key: 'dataSource',
            label: '数据源',
            children: (
              <Box p="l">
                <Alert
                  showIcon
                  message={
                    <Box>
                      该面板已移动到{' '}
                      <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => {
                          designer.setActiveSidebarPanel('dataSource');
                        }}
                      >
                        接口-数据源
                      </Button>{' '}
                      面板中
                    </Box>
                  }
                  type="info"
                />
              </Box>
            ),
          },
          {
            key: 'proxy',
            label: '代理',
            children: (
              <Box p="l">
                <Alert
                  showIcon
                  message={
                    <Box>
                      该面板已移动到{' '}
                      <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => {
                          designer.setActiveSidebarPanel('dataSource');
                        }}
                      >
                        接口-代理
                      </Button>{' '}
                      面板中
                    </Box>
                  }
                  type="info"
                />
              </Box>
            ),
          },
          {
            key: 'common',
            label: '其他',
            children: <CommonConfig />,
          },
        ]}
      />
    </Box>
  );
}
