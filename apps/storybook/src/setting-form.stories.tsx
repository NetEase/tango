import React from 'react';
import { FormModel, SettingForm, register } from '@music163/tango-setting-form';
import { IComponentPrototype } from '@music163/tango-helpers';
import { BorderSetter, DisplaySetter } from '@music163/tango-designer/src/setters/style-setter';
import { JsxSetter } from '@music163/tango-designer/src/setters/jsx-setter';
import { RenderSetter, TableCellSetter } from '@music163/tango-designer/src/setters/render-setter';
import { Box } from 'coral-system';
import { JsonView } from '@music163/tango-ui';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Card } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';

// 这里按需注入，因为部分 setter 依赖 Designer 的上下文
register({
  name: 'borderSetter',
  component: BorderSetter,
});

register({
  name: 'displaySetter',
  component: DisplaySetter,
});

register({
  name: 'jsxSetter',
  component: JsxSetter,
});

register({
  name: 'renderSetter',
  component: RenderSetter,
});

register({
  name: 'tableCellSetter',
  component: TableCellSetter,
});

createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_2891794_cou9i7556tl.js',
});

export default {
  title: 'SettingForm',
};

const prototype: IComponentPrototype = {
  name: 'Test',
  exportType: 'namedExport',
  title: '测试',
  icon: 'icon-test',
  type: 'element',
  category: 'basic',
  package: '@music163/antd',
  hasChildren: false,
  props: [
    {
      name: 'text',
      title: 'textSetter',
      setter: 'textSetter',
      tip: '这是一个文本属性',
      docs: 'https://music-one.fn.netease.com/docs/button',
      deprecated: '使用 text2 替代',
    },
    {
      name: 'display',
      title: 'displaySetter',
      setter: 'displaySetter',
    },
    {
      name: 'border',
      title: 'borderSetter',
      setter: 'borderSetter',
    },
    {
      name: 'onClick',
      title: 'eventSetter',
      tip: '当点击按钮时',
      setter: 'eventSetter',
      group: 'event',
    },
    {
      name: 'children',
      title: 'jsxSetter',
      setter: 'jsxSetter',
    },
    {
      name: 'render',
      title: 'renderSetter',
      setter: 'renderSetter',
    },
    {
      name: 'cell',
      title: 'tableCellSetter',
      setter: 'tableCellSetter',
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
      expression: `{ foo: 'foo' }`,
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
      <Box flex="0 0 400px" overflow="hidden">
        <SettingForm
          model={model}
          prototype={prototype}
          showIdentifier={{
            identifierKey: 'tid',
          }}
        />
      </Box>
      <Box position="relative">
        <Card title="表单状态预览" style={{ position: 'sticky', top: 0 }}>
          <FormValuePreview model={model} />
        </Card>
      </Box>
    </Box>
  );
}

export function Lite() {
  return (
    <Box width={320} border="solid">
      <SettingForm
        showSearch={false}
        showGroups={false}
        showItemSubtitle={false}
        prototype={prototype}
        disableSwitchExpressionSetter
      />
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
