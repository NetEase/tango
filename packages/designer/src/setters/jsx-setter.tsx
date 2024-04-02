import React from 'react';
import { isPlainString } from '@music163/tango-helpers';
import { ActionSelect, InputCode } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { Box } from 'coral-system';

const options = [
  { label: '取消自定义', value: '' },
  { label: '自定义区域', value: 'Box' },
  { label: '文本', value: 'Text' },
  { label: '占位区域', value: 'Placeholder' },
  { label: '按钮组', value: 'ButtonGroup' },
];

interface JsxSetterProps extends FormItemComponentProps {
  /**
   * 是否支持输入
   */
  showInput?: boolean;
  /**
   * 选择后生成的
   * @param key 用户选择的 key
   * @returns [tpl, deps] tpl 为返回的 jsx 内容；deps 为附加引入的组件名
   */
  getTemplate?: (key: string) => [tpl: string, deps: string[]];
}

const defaultGetTemplate = (key: string) => {
  let ret: [string, string[]];
  switch (key) {
    case 'Box':
      ret = ['<Box></Box>', ['Box']];
      break;
    case 'Text':
      ret = ['<Text>示例文本</Text>', ['Text']];
      break;
    case 'Placeholder':
      ret = ['<Placeholder text="拖拽到此进行替换" />', ['Placeholder']];
      break;
    case 'ButtonGroup':
      ret = [
        '<ButtonGroup><Button>按钮1</Button><Button>按钮2</Button></ButtonGroup>',
        ['ButtonGroup', 'Button'],
      ];
      break;
    default:
      break;
  }
  return ret;
};

/**
 * 自定义结点渲染器，适用于值类型为 ReactNode 的属性
 */
export function JsxSetter(props: JsxSetterProps) {
  const { showInput, getTemplate = defaultGetTemplate, value, onChange } = props;
  return (
    <Box>
      <ActionSelect
        showInput={showInput}
        defaultInputValue={isPlainString(value) ? value : undefined}
        options={options}
        text="设置此区域为"
        onInputChange={onChange}
        onSelect={(key) => {
          const [tpl, deps] = getTemplate(key);
          if (tpl) {
            onChange(`{${tpl}}`, { relatedImports: deps });
          } else {
            onChange(undefined);
          }
        }}
      />
      {value && <InputCode value={value} readOnly editable={false} />}
    </Box>
  );
}
