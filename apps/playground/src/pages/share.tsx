import React from 'react';
import { Box, Group } from 'coral-system';
import { Avatar, Space, Switch } from 'antd';
import { BranchesOutlined, MenuOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { registerSetter } from '@music163/tango-designer';
import type { ComponentPrototypeType } from '@music163/tango-helpers';
import { FooSetter } from '../components';

export const bootHelperVariables = [
  {
    key: '$helpers',
    title: '工具函数',
    children: [
      {
        title: 'setStoreValue',
        key: '() => tango.setStoreValue("variableName", "variableValue")',
        type: 'function',
      },
      {
        title: 'getStoreValue',
        key: '() => tango.getStoreValue("variableName")',
        type: 'function',
      },
      { title: 'openModal', key: '() => tango.openModal("")', type: 'function' },
      { title: 'closeModal', key: '() => tango.closeModal("")', type: 'function' },
      { title: 'navigateTo', key: '() => tango.navigateTo("/")', type: 'function' },
      { title: 'showToast', key: '() => tango.showToast("hello")', type: 'function' },
      { title: 'formatDate', key: '() => tango.formatDate("2022-12-12")', type: 'function' },
      { title: 'formatNumber', key: '() => tango.formatDate(9999)', type: 'function' },
      {
        title: 'copyToClipboard',
        key: '() => tango.copyToClipboard("hello")',
        type: 'function',
      },
    ],
  },
];

// folder-name
// 物料列表定义
const bizToggleButtonPrototype: ComponentPrototypeType = {
  name: 'CtPcToggleButton',
  exportType: 'defaultExport',
  title: '示例业务组件',
  icon: 'icon-tupian',
  type: 'element',
  docs: 'https://redstone.fn.netease.com/mt/fe-comp/w8bq8px7n5/toggle-button',
  hasChildren: false,
  props: [
    {
      name: 'checked',
      title: '是否选中',
      setter: 'boolSetter',
      defaultValue: false,
    },
    {
      name: 'children',
      title: '文本',
      setter: 'textSetter',
      initValue: '按钮',
    },
  ],
  package: '@music/ct-pc-toggle-button',
};

const sampleBlockCode = `
<Section>
  <Result
      status="success"
      title="Successfully Purchased Cloud Server ECS!"
      subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
      extra={[
        <Button type="primary" key="console">
          Go Console
        </Button>,
        <Button key="buy">Buy Again</Button>,
      ]}
    />
</Section>
`;

const SnippetSuccessResult: ComponentPrototypeType = {
  name: 'SnippetSuccessResult',
  title: '成功结果',
  icon: 'icon-tupian',
  type: 'snippet',
  package: '@music163/antd',
  initChildren: sampleBlockCode,
  relatedImports: ['Section', 'Result', 'Button'],
};

const Snippet2ColumnLayout: ComponentPrototypeType = {
  name: 'Snippet2ColumnLayout',
  title: '两列布局',
  icon: 'icon-columns',
  type: 'snippet',
  package: '@music163/antd',
  initChildren: `
  <Columns columns={12}>
    <Column colSpan={6}></Column>
    <Column colSpan={6}></Column>
  </Columns>
  `,
  relatedImports: ['Columns', 'Column'],
};

const Snippet3ColumnLayout: ComponentPrototypeType = {
  name: 'Snippet3ColumnLayout',
  title: '三列布局',
  icon: 'icon-column3',
  type: 'snippet',
  package: '@music163/antd',
  initChildren: `
  <Columns columns={12}>
    <Column colSpan={4}></Column>
    <Column colSpan={4}></Column>
    <Column colSpan={4}></Column>
  </Columns>
  `,
  relatedImports: ['Columns', 'Column'],
};

const SnippetButtonGroup: ComponentPrototypeType = {
  name: 'SnippetButtonGroup',
  title: '按钮组',
  icon: 'icon-anniuzu',
  type: 'snippet',
  package: '@music163/antd',
  initChildren: `
  <Space>
    <Button type="primary">按钮1</Button>
    <Button>按钮2</Button>
  </Space>
  `,
  relatedImports: ['Space', 'Button'],
};

export const prototypes = {
  CtPcToggleButton: bizToggleButtonPrototype,
  SnippetSuccessResult,
  Snippet2ColumnLayout,
  Snippet3ColumnLayout,
  SnippetButtonGroup,
};

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
