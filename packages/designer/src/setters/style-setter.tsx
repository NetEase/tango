import React, { useRef, useState } from 'react';
import { Box, Grid, HTMLCoralProps } from 'coral-system';
import { InputNumber, Dropdown, Input, Radio, Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';
import Color from 'color';
import { BgColorsOutlined, FileImageOutlined } from '@ant-design/icons';
import { SingleMonacoEditor, IconFont } from '@music163/tango-ui';
import { FormItemComponentProps, ChoiceSetter, TextSetter } from '@music163/tango-setting-form';
// import { ImageSetter } from './image-setter';

function getRawCssValue(value: string) {
  if (value && value.startsWith('{css`')) {
    return value.split('').slice(5, -2).join('').trim();
  }
  return value;
}

/**
 * 不稳定，暂不推荐使用
 */
export function CssCodeSetter({ value, onChange }: FormItemComponentProps<string>) {
  const contentValue = getRawCssValue(value);
  // TODO: relatedImports
  return (
    <Popover
      placement="leftBottom"
      title="自定义样式（CSS in JS）"
      content={
        <Box height={480} width={400}>
          <SingleMonacoEditor
            language="css"
            value={contentValue}
            onBlur={(newCode) => {
              if (newCode != contentValue) {
                onChange('{css`' + newCode + '`}', {
                  // relatedImports: ['']
                });
              }
            }}
          />
        </Box>
      }
    >
      <Button block>编写样式</Button>
    </Popover>
  );
}

/**
 * css display
 * @param props
 * @returns
 */
export function DisplaySetter(props: FormItemComponentProps) {
  return (
    <ChoiceSetter
      options={[
        { value: 'block', icon: 'icon-display-block', tip: '块级元素' },
        { value: 'inline-block', icon: 'icon-display-inline-block', tip: '行内块级元素' },
        { value: 'flex', icon: 'icon-flex', tip: 'Flex 弹性布局' },
        { value: 'grid', icon: 'icon-display-grid', tip: 'Grid 弹性网格布局' },
        { value: 'inline', icon: 'icon-display-inline', tip: '行内元素' },
        { value: 'none', icon: 'icon-display-none', tip: '不显示' },
      ]}
      mode="icon"
      {...props}
    />
  );
}

export function FlexDirectionSetter(props: FormItemComponentProps) {
  return (
    <ChoiceSetter
      options={[
        { value: 'column', icon: 'icon-direction-column', tip: '单行排列' },
        { value: 'column-reverse', icon: 'icon-direction-column-reverse', tip: '单行逆序' },
        { value: 'row', icon: 'icon-direction-row', tip: '纵向排列' },
        { value: 'row-reverse', icon: 'icon-direction-row-reverse', tip: '纵向逆序' },
      ]}
      mode="icon"
      {...props}
    />
  );
}

export function FlexJustifyContentSetter(props: FormItemComponentProps) {
  return (
    <ChoiceSetter
      options={[
        { value: 'flex-start', icon: 'icon-justify-flex-start', tip: '从行首起始位置开始排列' },
        { value: 'flex-end', icon: 'icon-justify-flex-end', tip: '从行尾位置开始排列' },
        { value: 'center', icon: 'icon-justify-center', tip: '居中排列' },
        {
          value: 'space-between',
          icon: 'icon-justify-space-between',
          tip: '均匀排列每个元素，首个元素放置于起点，末尾元素放置于终点',
        },
        {
          value: 'space-around',
          icon: 'icon-justify-space-around',
          tip: '均匀排列每个元素，每个元素周围分配相同的空间',
        },
      ]}
      mode="icon"
      {...props}
    />
  );
}

export function FlexAlignItemsSetter(props: FormItemComponentProps) {
  return (
    <ChoiceSetter
      options={[
        { value: 'flex-start', icon: 'icon-align-flex-start', tip: '元素向辅轴起点对齐' },
        { value: 'flex-end', icon: 'icon-align-flex-end', tip: '元素向辅轴终点对齐' },
        { value: 'center', icon: 'icon-align-center', tip: '元素在辅轴居中' },
        {
          value: 'stretch',
          icon: 'icon-align-stretch',
          tip: '弹性项包含外边距的交叉轴尺寸被拉升至行高',
        },
        { value: 'baseline', icon: 'icon-align-baseline', tip: '所有元素向基线对齐' },
      ]}
      mode="icon"
      {...props}
    />
  );
}

export function FlexGapSetter({ value, onChange }: FormItemComponentProps) {
  const values = parseGapValue(value);
  const tempRef = useRef([...values]);
  const handleChange = (index: number) => {
    return (val: string) => {
      tempRef.current[index] = `${val}px`;
      onChange(tempRef.current.join(' '));
    };
  };
  return (
    <Grid columns={2} spacing="m">
      <InputNumber
        addonBefore="主"
        addonAfter="px"
        defaultValue={values[0]}
        onChange={handleChange(0)}
      />
      <InputNumber
        addonBefore="辅"
        addonAfter="px"
        defaultValue={values[1]}
        onChange={handleChange(1)}
      />
    </Grid>
  );
}

function rgbaObjectToString(rbg: any) {
  return `rgba(${rbg.r}, ${rbg.g}, ${rbg.b}, ${rbg.a})`;
}

function normalizeColorObject(colorObject: any) {
  const { r, g, b, alpha } = colorObject;
  return {
    r,
    g,
    b,
    a: alpha,
  };
}

export function ColorSetter(props: FormItemComponentProps<string>) {
  const { value, onChange, placeholder = '请选择颜色' } = props;
  const color = hexColorPattern.test(value) ? value : normalizeColorObject(Color(value).object());
  const colorPanel = (
    <SketchPicker
      color={color}
      onChangeComplete={(newColor: any) => {
        const nextValue = newColor.rgb.a === 1 ? newColor.hex : rgbaObjectToString(newColor.rgb);
        if (typeof onChange === 'function') {
          onChange(nextValue);
        }
      }}
    />
  );
  return (
    <Dropdown overlay={colorPanel} trigger={['click']}>
      <Input
        prefix={
          <Box bg={value} border="solid" borderColor="gray.40" size="14px" borderRadius="s" />
        }
        allowClear
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (!e.target.value) {
            // clear input
            onChange(undefined);
          }
        }}
      />
    </Dropdown>
  );
}

const hexColorPattern = /^#[0-9a-fA-F]{3,}$/;
const imgUrlPattern = /^url\((.+)\)$/;

const getImageUrl = (url: string) => {
  const ret = imgUrlPattern.exec(url);
  if (ret && ret.length) {
    return ret[1];
  }
  return '';
};

export function BgSetter({ value, onChange }: FormItemComponentProps<string>) {
  const [mode, setMode] = useState<'color' | 'image'>(() => {
    if (!value) {
      return 'color';
    }
    return hexColorPattern.test(value) ? 'color' : 'image';
  });
  return (
    <Box>
      <Radio.Group
        defaultValue={mode}
        onChange={(e) => setMode(e.target.value)}
        buttonStyle="solid"
      >
        <Radio.Button value="color">
          <BgColorsOutlined />
        </Radio.Button>
        <Radio.Button value="image">
          <FileImageOutlined />
        </Radio.Button>
      </Radio.Group>
      <Box mt="m">
        {mode === 'color' && <ColorSetter value={value} onChange={onChange} />}
        {mode === 'image' && (
          <TextSetter
            value={getImageUrl(value)}
            onChange={(imgUrl) => {
              onChange(imgUrl ? `url(${imgUrl})` : undefined);
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export function SpacingSetter({ value, onChange }: FormItemComponentProps<string>) {
  const values = parseSpacingValue(value);
  const tempRef = useRef([...values]);
  const handleChange = (index: number) => {
    return (val: string) => {
      tempRef.current[index] = `${val}`;
      const str2px = tempRef.current.map((it) => {
        return it + 'px';
      });
      onChange(str2px.join(' '));
    };
  };

  return (
    <Grid columns={2} spacing="m">
      <InputNumber
        addonBefore="上"
        addonAfter="px"
        defaultValue={values[0]}
        onChange={handleChange(0)}
      />
      <InputNumber
        addonBefore="下"
        addonAfter="px"
        defaultValue={values[2]}
        onChange={handleChange(2)}
      />
      <InputNumber
        addonBefore="右"
        addonAfter="px"
        defaultValue={values[1]}
        onChange={handleChange(1)}
      />
      <InputNumber
        addonBefore="左"
        addonAfter="px"
        defaultValue={values[3]}
        onChange={handleChange(3)}
      />
    </Grid>
  );
}

function parseSpacingValue(value: string) {
  if (!value || typeof value !== 'string') {
    return ['0', '0', '0', '0'];
  }
  const arr = value.split(' ');
  if (arr.length === 1) {
    return ['0', '0', '0', '0'];
  }
  if (arr.length === 2) {
    const x = getPxValue(arr[1]);
    const y = getPxValue(arr[0]);
    return [y, x, y, x];
  }
  if (arr.length === 4) {
    return arr.map(getPxValue);
  }
}

function parseGapValue(value: string) {
  if (!value || typeof value !== 'string') {
    return ['0', '0'];
  }
  const arr = value.split(' ');
  if (arr.length === 1) {
    return ['0', '0'];
  }
  return arr.map(getPxValue);
}

const pxPattern = /^(\d+)px$/;

function getPxValue(value: string) {
  const match = pxPattern.exec(value);
  if (match && match.length) {
    return match[1];
  }
  return '0';
}

function parseBorderValue(value: string | number) {
  if (!value || typeof value !== 'string') {
    return ['0', 'none'];
  }

  return value.split(' ') as string[];
}

type BorderStyleType = 'none' | 'solid' | 'dashed';

export function BorderSetter({ value, onChange }: FormItemComponentProps<string>) {
  const valueParts = parseBorderValue(value);
  const [style, setStyle] = useState<BorderStyleType>(() => {
    if (/^(none|solid|dashed)$/.test(valueParts[1])) {
      return valueParts[1] as BorderStyleType;
    }
    return 'none';
  });
  const [width, setWidth] = useState<number>(Number(getPxValue(valueParts[0])) || 0);
  const [color, setColor] = useState<string>(valueParts[2] || '#000');

  const handleChange = (key: string, val: any) => {
    let ret: any[];
    switch (key) {
      case 'style': {
        ret = [width, val, color];
        break;
      }
      case 'width': {
        ret = [`${val}px`, style, color];
        break;
      }
      case 'color': {
        ret = [width, style, val];
        break;
      }
      default:
        ret = ['none'];
        break;
    }
    if (ret[1] === 'none') {
      ret = ['none'];
    }
    onChange(ret.join(' '));
  };

  return (
    <Box>
      <Label label="风格">
        <Radio.Group
          defaultValue={style}
          onChange={(e) => {
            setStyle(e.target.value);
            handleChange('style', e.target.value);
          }}
        >
          <Radio.Button value="none">
            <IconFont type="icon-display-none" title="none" />
          </Radio.Button>
          <Radio.Button value="solid">
            <IconFont type="icon-fengexian" title="solid" />
          </Radio.Button>
          <Radio.Button value="dashed">
            <IconFont type="icon-line-dashed" title="dashed" />
          </Radio.Button>
        </Radio.Group>
      </Label>
      {style !== 'none' && (
        <Box>
          <Label label="宽度" mt="m">
            <InputNumber
              defaultValue={width}
              addonAfter="px"
              min={0}
              onChange={(val) => {
                setWidth(val);
                handleChange('width', val);
              }}
            />
          </Label>
          <Label label="颜色" mt="m">
            <ColorSetter
              value={color}
              onChange={(val) => {
                setColor(val);
                handleChange('color', val);
              }}
            />
          </Label>
        </Box>
      )}
    </Box>
  );
}

function Label({ label, children, ...rest }: HTMLCoralProps<'div'> & { label?: string }) {
  return (
    <Box display="flex" alignItems="center" {...rest}>
      <Box mr="m">{label}</Box>
      <Box>{children}</Box>
    </Box>
  );
}
