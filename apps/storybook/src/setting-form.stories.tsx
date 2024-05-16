import React from 'react';
import { FormModel, SettingForm, register } from '@music163/tango-setting-form';
import { IComponentPrototype } from '@music163/tango-helpers';
import { BUILT_IN_SETTERS } from '@music163/tango-designer/src/setters';
import { Box } from 'coral-system';
import { JsonView } from '@music163/tango-ui';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Card } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';

const BLACK_LIST = ['codeSetter', 'eventSetter', 'modelSetter', 'routerSetter'];

BUILT_IN_SETTERS.filter((setter) => !BLACK_LIST.includes(setter.name)).forEach(register);

createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_2891794_cou9i7556tl.js',
});

export default {
  title: 'SettingForm',
};

/**
 * 表单值预览
 */
const FormValuePreview = observer(({ model }: { model: FormModel }) => {
  const data = toJS(model.values);
  return <JsonView src={data} />;
});

interface SettingFormDemoProps {
  initValues?: object;
  prototype?: IComponentPrototype;
}

function SettingFormDemo({ initValues, prototype }: SettingFormDemoProps) {
  const model = new FormModel(initValues, { onChange: console.log });
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

const prototypeHasBasicProps: IComponentPrototype = {
  name: 'Sample',
  package: 'sample-pkg',
  type: 'element',
  props: [
    {
      name: 'code',
      title: 'codeSetter',
      setter: 'codeSetter',
    },
    {
      name: 'text',
      title: 'textSetter',
      setter: 'textSetter',
    },
    {
      name: 'text2',
      title: 'textAreaSetter',
      setter: 'textAreaSetter',
    },
    {
      name: 'number',
      title: 'numberSetter',
      setter: 'numberSetter',
    },
    {
      name: 'number2',
      title: 'sliderSetter',
      setter: 'sliderSetter',
    },
    {
      name: 'bool',
      title: 'boolSetter',
      setter: 'boolSetter',
    },
    {
      name: 'enum',
      title: 'enumSetter',
      setter: 'enumSetter',
    },
    {
      name: 'list',
      title: 'listSetter',
      setter: 'listSetter',
    },
  ],
};

export function Basic() {
  return (
    <SettingFormDemo
      initValues={{
        bool: true,
        enum: {
          aaa: 'aaa',
          bbb: 'bbb',
          ccc: 'ccc',
        },
        list: [{ key: 1 }, { key: 2 }],
      }}
      prototype={prototypeHasBasicProps}
    />
  );
}

export function DeprecatedProp() {
  return (
    <SettingFormDemo
      prototype={{
        name: 'Deprecated',
        package: 'sample-pkg',
        type: 'element',
        props: [
          {
            name: 'number',
            title: 'numberSetter',
            setter: 'numberSetter',
            tip: '这是一个文本属性',
            docs: 'https://4x-ant-design.antgroup.com/components/slider-cn',
            deprecated: '使用 text2 替代',
          },
          {
            name: 'number1',
            title: 'sliderSetter',
            setter: 'sliderSetter',
          },
        ],
      }}
    />
  );
}

export function Validate() {
  return (
    <SettingFormDemo
      prototype={{
        name: 'Validate',
        package: 'sample-pkg',
        type: 'element',
        props: [
          {
            name: 'number',
            title: 'numberSetter',
            setter: 'numberSetter',
            validate: (value) => {
              if (!value && value !== 0) {
                return '必填';
              }
              if (value < 0) {
                return '必须大于 0';
              }
              if (value > 10) {
                return '必须小于等于 10';
              }
            },
          },
        ],
      }}
    />
  );
}

export function ObjectSetter() {
  return (
    <SettingFormDemo
      prototype={{
        name: 'Object',
        package: 'sample-pkg',
        type: 'element',
        props: [
          {
            name: 'text',
            title: 'textSetter',
            setter: 'textSetter',
          },
          {
            name: 'object',
            title: 'objectSetter',
            setter: 'objectSetter',
            props: [
              {
                name: 'text',
                title: 'textSetter',
                setter: 'textSetter',
              },
              {
                name: 'number',
                title: 'numberSetter',
                setter: 'numberSetter',
              },
            ],
          },
        ],
      }}
    />
  );
}

export function InitValues() {
  return (
    <SettingFormDemo
      initValues={{
        bool: true,
        bool1: '{{true}}',
        style: {
          background: 'red',
        },
        object: {
          text: 'text',
          number: 10,
        },
        object1: {
          text: 'text',
          number: '{{tango.stores.user?.age}}',
        },
        // 只会有一种情况传下来的是字符串，就是用户代码里存在 rest operator，这时候不需要额外处理，提示用户就使用代码模式
        object2: '{{{ text: "text22", number: 22, ...{ extra: "some" } }}}',
        list: [{ key: 'aaa' }, { key: 'bbb' }], // list object
        list1: "{{[{ key: 'aaa' }, { key: 'bbb' }]}}", // raw code
      }}
      prototype={{
        name: 'InitValues',
        package: 'sample-pkg',
        type: 'element',
        props: [
          {
            name: 'bool',
            title: 'value初始化',
            setter: 'boolSetter',
          },
          {
            name: 'bool1',
            title: 'value初始化',
            setter: 'boolSetter',
          },
          {
            name: 'bool2',
            title: '无初值',
            setter: 'boolSetter',
          },
          {
            name: 'style',
            title: 'codeSetter',
            setter: 'codeSetter',
          },
          {
            name: 'object',
            props: [
              {
                name: 'text',
                title: 'text',
                setter: 'textSetter',
              },
              {
                name: 'number',
                title: 'number',
                setter: 'numberSetter',
              },
            ],
          },
          {
            name: 'object1',
            props: [
              {
                name: 'text',
                title: 'text',
                setter: 'textSetter',
              },
              {
                name: 'number',
                title: 'number',
                setter: 'numberSetter',
              },
            ],
          },
          {
            name: 'object2',
            props: [
              {
                name: 'text',
                title: 'text',
                setter: 'textSetter',
              },
              {
                name: 'number',
                title: 'number',
                setter: 'numberSetter',
              },
            ],
          },
          {
            name: 'list',
            title: 'listSetter',
            setter: 'listSetter',
          },
          {
            name: 'list1',
            title: 'listSetter',
            setter: 'listSetter',
          },
        ],
      }}
    />
  );
}

export function Lite() {
  return (
    <Box width={320} border="solid" borderColor="line2">
      <SettingForm
        showSearch={false}
        showGroups={false}
        showItemSubtitle={false}
        prototype={prototypeHasBasicProps}
        disableSwitchExpressionSetter
      />
    </Box>
  );
}

export function HideToggleCode() {
  const model = new FormModel({});
  return (
    <Box width={320} border="solid" borderColor="line2">
      <SettingForm model={model} prototype={prototypeHasBasicProps} disableSwitchExpressionSetter />
    </Box>
  );
}

const prototypeHasExtraProps: IComponentPrototype = {
  name: 'ExtraProps',
  type: 'element',
  package: '@music163/antd',
  props: [
    {
      name: 'choice',
      title: 'choiceSetter',
      setter: 'choiceSetter',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' },
      ],
    },
    {
      name: 'picker',
      title: 'pickerSetter',
      setter: 'pickerSetter',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' },
      ],
    },
    {
      name: 'actionList',
      title: 'actionListSetter',
      setter: 'actionListSetter',
    },
    {
      name: 'list',
      title: 'listSetter',
      setter: 'listSetter',
    },
    {
      name: 'options',
      title: 'optionSetter',
      setter: 'optionSetter',
    },
    {
      name: 'columns',
      title: 'tableColumnsSetter',
      setter: 'tableColumnsSetter',
    },
    {
      name: 'css',
      title: 'cssSetter',
      setter: 'cssSetter',
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
      name: 'time',
      title: 'timeSetter',
      setter: 'timeSetter',
    },
    {
      name: 'time',
      title: 'timeRangeSetter',
      setter: 'timeRangeSetter',
    },
    {
      name: 'enum',
      title: 'enumSetter',
      setter: 'enumSetter',
    },
    {
      name: 'event',
      title: 'eventSetter',
      setter: 'eventSetter',
    },
    {
      name: 'json',
      title: 'jsonSetter',
      setter: 'jsonSetter',
    },
    {
      name: 'jsx',
      title: 'jsxSetter',
      setter: 'jsxSetter',
    },
    {
      name: 'render',
      title: 'renderPropsSetter',
      setter: 'renderPropsSetter',
    },
    {
      name: 'cell',
      title: 'tableCellSetter',
      setter: 'tableCellSetter',
    },
    {
      name: 'expandable',
      title: 'tableExpandableSetter',
      setter: 'tableExpandableSetter',
    },
    {
      name: 'router',
      title: 'routerSetter',
      setter: 'routerSetter',
    },
  ],
};

export function ExtraSetters() {
  return (
    <SettingFormDemo
      initValues={{
        router: 'www.163.com',
        expression: `{ foo: 'foo' }`,
        object: {
          name: 'Alice',
        },
        image:
          'https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/13270238619/2cc5/0782/1d6e/009b96bf90c557b9bbde09b1687a2c80.png',
      }}
      prototype={prototypeHasExtraProps}
    />
  );
}

export function StyleProps() {
  return (
    <SettingFormDemo
      prototype={{
        name: 'Box',
        title: 'Box',
        type: 'element',
        package: '@music163/antd',
        props: [
          {
            name: 'style',
            title: 'styleSetter',
            setter: 'styleSetter',
          },
          {
            name: 'display',
            title: 'displaySetter',
            setter: 'displaySetter',
          },
          {
            name: 'flexDirection',
            title: 'flexDirectionSetter',
            setter: 'flexDirectionSetter',
          },
          {
            name: 'flexGap',
            title: 'flexGapSetter',
            setter: 'flexGapSetter',
          },
          {
            name: 'flexJustifyContent',
            title: 'flexJustifyContentSetter',
            setter: 'flexJustifyContentSetter',
          },
          {
            name: 'flexAlignItems',
            title: 'flexAlignItemsSetter',
            setter: 'flexAlignItemsSetter',
          },
          {
            name: 'spacing',
            title: 'spacingSetter',
            setter: 'spacingSetter',
          },
          {
            name: 'color',
            title: 'colorSetter',
            setter: 'colorSetter',
          },
          {
            name: 'bg',
            title: 'bgSetter',
            setter: 'bgSetter',
          },
          {
            name: 'border',
            title: 'borderSetter',
            setter: 'borderSetter',
          },
        ],
      }}
    />
  );
}
