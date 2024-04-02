import React from 'react';
import { Box, Group } from 'coral-system';
import { Avatar, Space, Switch } from 'antd';
import { BranchesOutlined, MenuOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { registerSetter } from '@music163/tango-designer';
import type { IVariableTreeNode } from '@music163/tango-helpers';
import { FooSetter } from '../components';

export * from './mock-files';

export const bootHelperVariables: IVariableTreeNode[] = [
  {
    key: '$helpers',
    title: '工具函数',
    children: [
      {
        title: '设置变量值',
        key: '() => tango.setStoreValue("variableName", "variableValue")',
        type: 'function',
        help: '设置状态值，tango.setStoreValue("variableName", "variableValue")',
      },
      {
        title: '获取变量值',
        key: '() => tango.getStoreValue("variableName")',
        type: 'function',
        help: '获取状态值',
      },
      { title: '打开弹窗', key: '() => tango.openModal("")', type: 'function' },
      { title: '关闭弹窗', key: '() => tango.closeModal("")', type: 'function' },
      { title: '切换路由', key: '() => tango.navigateTo("/")', type: 'function' },
      {
        title: '拷贝到剪贴板',
        key: '() => tango.copyToClipboard("hello")',
        type: 'function',
      },
    ],
  },
];

// 注册自定义 setter
registerSetter({
  name: 'fooSetter',
  component: FooSetter,
});

// 平台 Logo
export function Logo() {
  return (
    <Box width="50px" display="flex" alignItems="center" justifyContent="center" fontSize="20px">
      <MenuOutlined />
    </Box>
  );
}

// 项目信息
export function ProjectDetail() {
  return (
    <Box display="flex" alignItems="center" columnGap="l">
      <Box className="ProjectName" fontSize="18px" fontWeight="bold">
        community-test
      </Box>
      <Box className="BranchName" as="code" fontSize="14px">
        <BranchesOutlined /> feature/list
      </Box>
    </Box>
  );
}

export function SidebarFooter() {
  return (
    <Space direction="vertical" align="center">
      <QuestionCircleOutlined style={{ fontSize: 20 }} />
      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
    </Space>
  );
}

interface ActionsProps {
  defaultChecked?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  onChange?: (checked: boolean) => void;
}

// 平台核心行动点
export function Actions({ defaultChecked }: ActionsProps) {
  return (
    <Group spacingX="8px">
      <Switch defaultChecked={defaultChecked} checkedChildren="新版" unCheckedChildren="老版" />
    </Group>
  );
}

export const menuData: any = {
  // 常用组件
  common: [
    {
      title: '基本',
      items: [
        'Button',
        'ButtonGroup',
        'ActionList',
        'Action',
        'Image',
        'Text',
        'MultilineText',
        'Link',
        'Title',
        'Paragraph',
        'Icon',
      ],
    },
    {
      title: '数据和逻辑',
      items: ['When', 'DataProvider', 'Interval', 'Each'],
    },
    {
      title: '基础布局',
      items: [
        'Section',
        'Columns',
        'Box',
        'Divider',
        'Space',
        'Tabs',
        'Toolbar',
        'Modal',
        'Drawer',
        'SnippetButtonGroup',
        'Snippet2ColumnLayout',
        'Snippet3ColumnLayout',
        'SnippetSuccessResult',
      ],
    },
    {
      title: '表单表格',
      items: [
        'XTable',
        'XEditableTable',
        // 'Table',
        'XForm',
        'XFormItem',
        'XStepForms',
        // 'SearchForm',
        // 'Form',
        // 'FormItem',
      ],
    },
    {
      title: '常用图表',
      items: [
        'ChartContainer',
        'BarChart',
        'LineChart',
        'PieChart',
        'FunnelChart',
        'ScatterChart',
        'RadarChart',
        'WordCloud',
      ],
    },
    {
      title: '导航',
      items: [
        'Breadcrumb',
        'Dropdown',
        'Menu',
        // 'PageHeader',
        'Pagination',
        'Steps',
      ],
    },
    {
      title: '数据录入',
      items: [
        'AutoComplete',
        'Cascader',
        'Checkbox',
        'CheckboxGroup',
        'DatePicker',
        'DateRangePicker',
        'WeekPicker',
        'MonthPicker',
        'YearPicker',
        'Input',
        'InputNumber',
        'InputKV',
        'Mentions',
        'Radio',
        'RadioGroup',
        'Rate',
        'Select',
        'Slider',
        'Switch',
        'Search',
        'TextArea',
        'TimePicker',
        'TimeRangePicker',
        'Transfer',
        'TreeSelect',
        'Upload',
        'NosUpload',
      ],
    },
    {
      title: '数据展示',
      items: [
        'Avatar',
        'Badge',
        'RibbonBadge',
        'Calendar',
        'Card',
        'Carousel',
        'Collapse',
        'Comment',
        'Descriptions',
        'Empty',
        'Image',
        'List',
        'Popover',
        'Statistic',
        'Table',
        'Tag',
        'CheckableTag',
        'Skeleton',
        'SkeletonAvatar',
        'SkeletonButton',
        'SkeletonInput',
        'SkeletonImage',
        'SkeletonNode',
        'Spin',
        'Timeline',
        'Tooltip',
        'Tree',
      ],
    },
    {
      title: '反馈',
      items: [
        'Alert',
        'Drawer',
        // 'Message',
        'Modal',
        'Notification',
        'Popconfirm',
        'Progress',
        'Result',
      ],
    },
  ],
};
