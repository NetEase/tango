import React, { useCallback, useEffect, useState } from 'react';
import { Box } from 'coral-system';
// @ts-ignore
import { toJSON } from 'cssjson';
import { InputNumber, Slider, Space } from 'antd';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import {
  BgSetter,
  BorderSetter,
  ColorSetter,
  CssCodeSetter,
  DisplaySetter,
  FlexAlignItemsSetter,
  FlexDirectionSetter,
  FlexJustifyContentSetter,
  SpacingSetter,
} from './style-setter';
import { wrapCode } from '@music163/tango-helpers';

const getRawCssValue = (value: string) => {
  if (value && value.startsWith('{{css`')) {
    return value.split('').slice(6, -3).join('').trim();
  }
  return value;
};

const getPxValue = (value: string) => {
  const match = pxPattern.exec(value);
  if (match && match.length) {
    return match[1];
  }
  return '0';
};

const pxPattern = /^(\d+)px$/; // px校验

// 动态正则
const cssPattern = (string: string, name: string): any => {
  // FIXME: check this pattern
  // eslint-disable-next-line no-useless-escape
  const re1 = new RegExp(`(?<=\s*?\n*?;?\s*?\n*?${name}\s*).*?(?=;)`, 'g');
  // eslint-disable-next-line no-useless-escape
  const re2 = new RegExp(`(?<=^[\s]*?${name}).*?(?=;)`, 'g');
  if (re1.test(string)) {
    return re1;
  } else if (re2.test(string)) {
    return re2;
  } else {
    return false;
  }
};

/**
 * coral-system css prop
 * @example 提供 css-in-js 代码支持，例如 css`background: red;`
 * @deprecated 使用嵌套属性代替
 */
export function CssSetter(props: FormItemComponentProps<string>) {
  const { value: valueProp, onChange } = props;
  const [contentValue, setContentValue] = useState<string>(() => getRawCssValue(valueProp));
  const [display, setDisplay] = useState('');

  // 修改指定的CSS样式
  const changeStyle = useCallback(
    (value: any, name: string) => {
      if (!contentValue) {
        setContentValue((it) => (it ? `${it}\n${name}: ${value};` : `\n${name}: ${value};`));
      } else if (cssPattern(contentValue, name)) {
        const str = contentValue.replace(cssPattern(contentValue, name), `:${value}`);
        setContentValue(str);
      } else {
        setContentValue((it) => (it ? `${it}\n${name}: ${value};` : `\n${name}: ${value};`));
      }
    },
    [contentValue],
  );

  // 代码编辑器
  const codeEditorChange = useCallback((value: string) => {
    const val = getRawCssValue(value);
    setContentValue(val);
  }, []);

  useEffect(() => {
    if (contentValue || contentValue === '') {
      onChange(wrapCode(`css\`${contentValue}\``));
    }
  }, [contentValue]);

  const isFlex = ['flex', 'inline-flex'].includes(display);

  return (
    <Box bg="fill1">
      <ItemGroup title="布局方式">
        <DisplaySetter
          value={toJSON(contentValue).attributes?.display}
          onChange={(v) => {
            setDisplay(v);
            changeStyle(v, 'display');
          }}
        />
      </ItemGroup>
      {isFlex ? (
        <>
          <ItemGroup title="主轴方向">
            <FlexDirectionSetter
              value={toJSON(contentValue).attributes?.['flex-direction']}
              onChange={(v) => {
                changeStyle(v, 'flex-direction');
              }}
            />
          </ItemGroup>
          <ItemGroup title="主轴对齐方式">
            <FlexJustifyContentSetter
              value={toJSON(contentValue).attributes?.['justify-content']}
              onChange={(v) => {
                changeStyle(v, 'justify-content');
              }}
            />
          </ItemGroup>
          <ItemGroup title="辅轴对齐方式">
            <FlexAlignItemsSetter
              value={toJSON(contentValue).attributes?.['align-items']}
              onChange={(v) => {
                changeStyle(v, 'align-items');
              }}
            />
          </ItemGroup>
        </>
      ) : null}
      <ItemGroup title="外边距">
        <SpacingSetter
          value={toJSON(contentValue).attributes?.margin}
          onChange={(v) => {
            changeStyle(v, 'margin');
          }}
        />
      </ItemGroup>
      <ItemGroup title="内边距">
        <SpacingSetter
          value={toJSON(contentValue).attributes?.padding}
          onChange={(v) => {
            changeStyle(v, 'padding');
          }}
        />
      </ItemGroup>
      <ItemGroup title="宽高">
        <Space>
          <InputNumber
            addonBefore="宽度"
            addonAfter="px"
            defaultValue={getPxValue(toJSON(contentValue).attributes?.width)}
            onChange={(v) => {
              changeStyle(`${v}px`, 'width');
            }}
          />
          <InputNumber
            addonBefore="高度"
            addonAfter="px"
            defaultValue={getPxValue(toJSON(contentValue).attributes?.height)}
            onChange={(v) => {
              changeStyle(`${v}px`, 'height');
            }}
          />
        </Space>
      </ItemGroup>
      <ItemGroup title="文字颜色">
        <ColorSetter
          value={toJSON(contentValue).attributes?.color}
          onChange={(v) => {
            changeStyle(v, 'color');
          }}
        />
      </ItemGroup>
      <ItemGroup title="文字大小">
        <InputNumber
          addonBefore="字体大小"
          addonAfter="px"
          defaultValue={getPxValue(toJSON(contentValue).attributes?.['font-size'])}
          onChange={(v) => {
            changeStyle(`${v}px`, 'font-size');
          }}
        />
      </ItemGroup>
      <ItemGroup title="背景">
        <BgSetter
          value={toJSON(contentValue).attributes?.background}
          onChange={(v) => {
            if (RegExp(/url/).test(v)) {
              changeStyle(v, 'background-image');
            } else {
              changeStyle(v, 'background-color');
            }
          }}
        />
      </ItemGroup>
      <ItemGroup title="边框">
        <BorderSetter
          value={toJSON(contentValue).attributes?.border}
          onChange={(v) => {
            changeStyle(v, 'border');
          }}
        />
      </ItemGroup>
      <ItemGroup title="透明度">
        <Slider
          max={1}
          min={0}
          step={0.1}
          value={toJSON(contentValue).attributes?.opacity || 1}
          onChange={(v: number) => {
            changeStyle(v, 'opacity');
          }}
        />
      </ItemGroup>
      <ItemGroup title="样式编写">
        <CssCodeSetter value={contentValue} onChange={codeEditorChange} />
      </ItemGroup>
    </Box>
  );
}

interface ItemGroupProps {
  title?: string;
  children?: React.ReactNode;
}

function ItemGroup({ title, children }: ItemGroupProps) {
  return (
    <Box borderBottom="solid" borderBottomColor="gray.30" px="m">
      <Box pt="m">{title}</Box>
      <Box py="m">{children}</Box>
    </Box>
  );
}
