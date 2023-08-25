import React, { useMemo } from 'react';
import { Tabs as AntTabs, TabsProps as AntTabsProps } from 'antd';

const defaultTabBarStyle: React.CSSProperties = { paddingLeft: 12, paddingRight: 12, margin: 0 };
const centerTabBarStyle: React.CSSProperties = { margin: 0 };

export interface TabsProps extends AntTabsProps {
  isTabBarSticky?: boolean;
  tabBarStickyOffset?: number;
}

export function Tabs({
  centered,
  isTabBarSticky = false,
  tabBarStickyOffset = 0,
  ...rest
}: TabsProps) {
  const tabBarStyle = useMemo(() => {
    let ret = centered ? centerTabBarStyle : defaultTabBarStyle;
    if (isTabBarSticky) {
      ret = { ...ret, position: 'sticky', top: tabBarStickyOffset, zIndex: 1, background: '#fff' };
    }
    return ret;
  }, [centered, isTabBarSticky, tabBarStickyOffset]);

  return (
    <AntTabs
      size="small"
      tabBarGutter={24}
      centered={centered}
      tabBarStyle={tabBarStyle}
      {...rest}
    />
  );
}

Tabs.TabPane = AntTabs.TabPane;
