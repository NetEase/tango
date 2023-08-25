import React, { useState } from 'react';
import { EditableVariableTree, FormModel, SettingForm } from '@music163/tango-setting-form';
import { ComponentPrototypeType, getValue } from '@music163/tango-helpers';
import { createServices } from '@music163/request';
import { Box } from 'coral-system';
import { JsonView } from '@music163/tango-ui';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Card } from 'antd';

export default {
  title: 'SettingForm/ Setters',
};

const modelVariables = [
  {
    title: 'stores',
    key: 'stores',
    selectable: false,
    children: [
      {
        title: 'app',
        key: 'stores.app',
        selectable: false,
        children: [
          { title: 'app.title', key: 'stores.app.title', raw: '"hello"' },
          { title: 'app.age', key: 'stores.app.age', raw: '20' },
          { title: 'app.detail', key: 'stores.app.detail', raw: '{ foo: "foo" }' },
          { title: 'app.list', key: 'stores.app.list', type: 'function', raw: '() => {}' },
        ],
      },
      {
        title: 'user',
        key: 'stores.user',
        selectable: false,
        children: [
          { title: 'name', key: 'stores.user.name' },
          { title: 'age', key: 'stores.user.age' },
        ],
      },
    ],
  },
  {
    title: 'services',
    key: 'services',
    selectable: false,
    children: [
      {
        title: 'listUsers',
        key: 'services.listUsers',
        type: 'function',
      },
    ],
  },
];

const prototype: ComponentPrototypeType = {
  name: 'Test',
  exportType: 'namedExport',
  title: '测试',
  icon: 'icon-test',
  type: 'element',
  category: 'basic',
  package: '@music/tango-cms',
  hasChildren: false,
  props: [
    {
      name: 'text',
      title: 'textSetter',
      setter: 'textSetter',
    },
    {
      name: 'router',
      title: 'routerSetter',
      setter: 'routerSetter',
    },
    {
      name: 'object',
      title: '对象属性',
      tip: '一个嵌套的对象',
      props: [
        {
          name: 'name',
          title: 'Name',
          setter: 'textSetter',
        },
        {
          name: 'age',
          title: 'Age',
          setter: 'numberSetter',
        },
        {
          name: 'address',
          title: 'Address',
          props: [
            {
              name: 'city',
              title: 'City',
              setter: 'textSetter',
            },
          ],
        },
      ],
      getVisible: (form) => {
        return form.getValue('text') !== 'test';
      },
    },
    {
      name: 'expression',
      title: 'expressionSetter',
      setter: 'expressionSetter',
    },
    {
      name: 'model',
      title: 'modelSetter',
      setter: 'modelSetter',
    },
    {
      name: 'image',
      title: 'imageSetter',
      setter: 'imageSetter',
    },
    {
      name: 'css',
      title: 'cssSetter',
      setter: 'cssSetter',
    },
    {
      name: 'extra',
      title: 'jsxSetter',
      setter: 'jsxSetter',
    },
    {
      name: 'icon',
      title: 'iconSetter',
      setter: 'iconSetter',
    },
    {
      name: 'iconType',
      title: 'iconTypeSetter',
      setter: 'iconTypeSetter',
    },
    {
      name: 'onClick',
      title: 'eventSetter',
      tip: '当点击按钮时',
      setter: 'eventSetter',
      group: 'event',
    },
    {
      name: 'onClick2',
      title: 'actionSetter',
      tip: '当点击按钮时',
      setter: 'actionSetter',
      group: 'event',
    },
    {
      name: 'disabled',
      title: 'boolSetter',
      tip: 'disabled 是否禁用',
      defaultValue: false,
      setter: 'boolSetter',
    },
    {
      name: 'size',
      title: 'choiceSetter',
      tip: 'size 按钮的尺寸',
      defaultValue: 'medium',
      setter: 'choiceSetter',
      setterProps: {
        options: [
          { label: '小', value: 'small' },
          { label: '中', value: 'medium' },
          { label: '大', value: 'large' },
        ],
      },
    },
    {
      name: 'color',
      title: 'colorSetter',
      setter: 'colorSetter',
    },
    {
      name: 'columns',
      title: 'columnSetter',
      setter: 'columnSetter',
    },
    {
      name: 'date',
      title: 'dateSetter',
      setter: 'dateSetter',
    },
    {
      name: 'dateRange',
      title: 'dateRangeSetter',
      setter: 'dateRangeSetter',
    },
    {
      name: 'enum',
      title: 'enumSetter',
      setter: 'enumSetter',
      setterProps: {},
    },
    {
      name: 'time',
      title: 'timeSetter',
      setter: 'timeSetter',
    },
    {
      name: 'timeRange',
      title: 'timeRangeSetter',
      setter: 'timeRangeSetter',
    },
    {
      name: 'dataSource',
      title: 'jsonSetter 不推荐',
      setter: 'jsonSetter',
    },
    {
      name: 'listSetter',
      title: 'listSetter',
      setter: 'listSetter',
    },
    {
      name: 'count',
      title: 'numberSetter',
      setter: 'numberSetter',
    },
    {
      name: 'options',
      title: 'optionSetter',
      setter: 'optionSetter',
    },
    {
      name: 'type',
      title: 'pickerSetter',
      defaultValue: 'solid',
      setter: 'pickerSetter',
      setterProps: {
        options: [
          { label: '文本型', value: 'text' },
          { label: '实体型', value: 'solid' },
          { label: '幽灵', value: 'ghost' },
        ],
      },
    },
    {
      name: 'title',
      title: 'textSetter',
      setter: 'textSetter',
    },
    {
      name: 'invalid',
      title: 'invalidSetter',
      setter: 'invalidSetter',
    },
  ],
};

const deerService = createServices(
  {
    listMy: {
      url: '/my/upload/list',
    },
    listFav: {
      url: '/my/star/list',
    },
    listPub: {
      url: '/list',
    },
  },
  {
    baseURL: 'https://febase-openapi.fn.netease.com/deer/api/deer/pic',
    withCredentials: false, // 解决跨域时必须非*问题
    headers: {
      'Febase-Auth': 'dskPVkIRnQ2dEn1DbyxURmUj4rl4BsCh53xFAsJnvVs=',
    },
  },
);

const context = {
  stores: {
    app: {
      title: 'Sample App',
      age: 20,
      detail: {
        foo: 'foo',
        bar: 'bar',
        biz: {
          x: 'xxx',
        },
      },
      newKey: 'xxx',
    },
    foo: {
      test: 'test string',
    },
  },
};

/**
 * 表单值预览
 */
const FormValuePreview = observer(({ model }: { model: FormModel }) => {
  const data = toJS(model.values);
  return <JsonView src={data} />;
});

export function Basic() {
  const model = new FormModel(
    {
      router: 'www.163.com',
      expression: {
        foo: 'foo',
      },
      object: {
        name: 'Alice',
      },
      image:
        'https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/13270238619/2cc5/0782/1d6e/009b96bf90c557b9bbde09b1687a2c80.png',
    },
    { onChange: console.log },
  );

  return (
    <Box display="flex">
      <SettingForm
        model={model}
        remoteServices={{
          ImageService: deerService as any,
        }}
        prototype={prototype}
        evaluateContext={{
          tango: context,
          __UNSAFE_TANGO_CURRENT_PAGE_RENDER_RUNTIME__: { routeData: { params: {}, query: {} } },
        }}
        modelVariables={modelVariables}
        expressionVariables={modelVariables}
      />
      <Box position="relative">
        <Card title="表单状态预览" style={{ position: 'sticky', top: 0 }}>
          <FormValuePreview model={model} />
        </Card>
      </Box>
    </Box>
  );
}

export function NoExpressionSwitch() {
  const model = new FormModel({});
  return (
    <Box>
      <SettingForm model={model} prototype={prototype} disableSwitchExpressionSetter />
    </Box>
  );
}

export function Binding() {
  const [data, setData] = useState<any>({});
  return (
    <Box>
      <Box as="code" bg="highlight" color="white" fontSize="24px">
        selected: {data?.key}
      </Box>
      <EditableVariableTree
        dataSource={modelVariables as any}
        getPreviewValue={(node) => {
          if (!node || !node.key) {
            return;
          }
          if (node.type === 'function') {
            return node.raw;
          }
          const keyPath = node.key.replaceAll('?', '');
          return getValue(context, keyPath);
        }}
        onSelect={setData}
        onAddVariable={console.log}
        onSave={console.log}
      />
    </Box>
  );
}
