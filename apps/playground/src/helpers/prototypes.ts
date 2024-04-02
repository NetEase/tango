import * as basePrototypes from '@music163/antd/prototypes';
import type { IComponentPrototype, Dict } from '@music163/tango-helpers';

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

const SnippetSuccessResult: IComponentPrototype = {
  name: 'SnippetSuccessResult',
  title: '成功结果',
  icon: 'icon-tupian',
  type: 'snippet',
  package: '@music163/antd',
  initChildren: sampleBlockCode,
  relatedImports: ['Section', 'Result', 'Button'],
};

const Snippet2ColumnLayout: IComponentPrototype = {
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

const Snippet3ColumnLayout: IComponentPrototype = {
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

const SnippetButtonGroup: IComponentPrototype = {
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

// hack some prototypes
basePrototypes['Section'].siblingNames = [
  'SnippetButtonGroup',
  'Section',
  'Section',
  'Section',
  'Section',
  'Section',
  'Section',
  'Section',
];

// iconfont: https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=2891794
const prototypes: Dict<IComponentPrototype> = {
  ...(basePrototypes as any),
  SnippetSuccessResult,
  Snippet2ColumnLayout,
  Snippet3ColumnLayout,
  SnippetButtonGroup,
  Box: {
    name: 'Box',
    title: '盒子',
    icon: 'icon-mianban',
    type: 'container',
    package: '@music163/antd',
    hasChildren: true,
    siblingNames: ['Box'],
  },
  Columns: {
    name: 'Columns',
    type: 'container',
    icon: 'icon-column-4',
    package: '@music163/antd',
    hasChildren: true,
    childrenNames: ['Column'],
  },
  Column: {
    name: 'Column',
    type: 'container',
    icon: 'icon-juxing',
    package: '@music163/antd',
    hasChildren: true,
    siblingNames: ['Column'],
  },
  Text: {
    name: 'Text',
    type: 'element',
    icon: 'icon-wenzi',
    package: '@music163/antd',
    initChildren: '文本内容',
  },
  Placeholder: {
    name: 'Placeholder',
    type: 'element',
    package: '@music163/antd',
  },
  ButtonGroup: {
    name: 'ButtonGroup',
    type: 'element',
    package: '@music163/antd',
    hasChildren: true,
    childrenNames: ['Button'],
  },
};

export default prototypes;
