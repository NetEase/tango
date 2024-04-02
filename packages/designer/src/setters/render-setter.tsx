import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionSelect, InputCode } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { Box } from 'coral-system';

interface IRenderOption {
  label: string;
  value: string;
  render?: string;
  relatedImports?: string[];
}

export interface RenderSetterProps {
  text?: string;
  options?: IRenderOption[];
  fallbackOption?: IRenderOption;
}

/**
 * Render Props Setters
 */
export function RenderSetter({
  value,
  onChange,
  text = '自定义渲染为',
  options = [],
  fallbackOption,
}: FormItemComponentProps & RenderSetterProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const optionsMap = useMemo(() => {
    return options.reduce((prev, cur) => {
      prev[cur.value] = cur;
      return prev;
    }, {});
  }, [options]);

  const onSelect = useCallback(
    (key: string) => {
      const option = optionsMap[key] || fallbackOption;
      if (option?.render) {
        onChange(option.render, { relatedImports: option.relatedImports });
      } else {
        onChange(undefined);
      }
    },
    [optionsMap, fallbackOption, onChange],
  );
  return (
    <Box>
      <ActionSelect text={text} options={options} onSelect={onSelect} />
      {value && (
        <InputCode
          value={value}
          onChange={(val) => setInputValue(val)}
          onBlur={() => onChange(inputValue)}
        />
      )}
    </Box>
  );
}

const getRender = (content: string, type?: 'tableCell' | 'tableExpandable') => {
  switch (type) {
    case 'tableCell':
      return `{(value, record, index) => ${content}}`;
    case 'tableExpandable':
      return `{{
      expandedRowRender: (record) =>  ${content},
      rowExpandable: (record) => true
    }}`;
    default:
      return `{() => ${content}}`;
  }
};

const tableCellOptions: RenderSetterProps['options'] = [
  { label: '取消自定义', value: '' },
  {
    label: '自定义区域',
    value: 'Box',
    render: getRender('<Box></Box>', 'tableCell'),
    relatedImports: ['Box'],
  },
  {
    label: '标签',
    value: 'Tag',
    render: getRender('<Tag>tag</Tag>', 'tableCell'),
    relatedImports: ['Tag'],
  },
  {
    label: '按钮',
    value: 'Button',
    render: getRender('<Button>button</Button>', 'tableCell'),
    relatedImports: ['Button'],
  },
  {
    label: '图片',
    value: 'Image',
    render: getRender('<Image width={150} src="https://picsum.photos/100" />', 'tableCell'),
    relatedImports: ['Image'],
  },
];

const tableExpandableOptions: RenderSetterProps['options'] = [
  {
    label: '设置可展开行',
    value: 'Box',
    render: getRender('<Box></Box>', 'tableExpandable'),
    relatedImports: ['Box'],
  },
  { label: '取消可展开行', value: '' },
];

export function TableCellSetter(props: FormItemComponentProps) {
  return <RenderSetter options={tableCellOptions} {...props} />;
}

export function TableExpandableSetter(props: FormItemComponentProps) {
  return <RenderSetter options={tableExpandableOptions} text="配置表格可展开行" {...props} />;
}
