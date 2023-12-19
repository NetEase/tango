import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Tabs as AntTabs, TabsProps as AntTabsProps } from 'antd';

const StyledTabs = styled(AntTabs)<any>`
  .ant-tabs-nav {
    padding-left: 12px;
    padding-right: 12px;
    margin: 0;
  }

  &.sticky .ant-tabs-nav {
    position: sticky;
    top: ${(props) => props.$stickyOffset};
    z-index: 2;
    background: #fff;
  }

  &.ant-tabs-centered .ant-tabs-nav {
    margin: 0;
  }
`;

export interface TabsProps extends AntTabsProps {
  isTabBarSticky?: boolean;
  tabBarStickyOffset?: number;
}

export function Tabs({
  centered,
  isTabBarSticky = false,
  tabBarStickyOffset = 0,
  className,
  ...rest
}: TabsProps) {
  const classNames = cx(className, { sticky: isTabBarSticky });

  return (
    <StyledTabs
      size="small"
      tabBarGutter={24}
      centered={centered}
      className={classNames}
      $stickyOffset={tabBarStickyOffset}
      {...rest}
    />
  );
}

Tabs.TabPane = AntTabs.TabPane;
