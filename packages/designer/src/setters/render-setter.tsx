import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionSelect, InputCode } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { Box } from 'coral-system';
import { Dict, IOptionItem } from '@music163/tango-helpers';
import { getCallbackValue } from './code-setter';

export interface RenderSetterProps {
  text?: string;
  options?: IOptionItem[];
  fallbackOption?: IOptionItem;
}

const defaultOptions: IOptionItem[] = [
  { label: '取消自定义', value: '' },
  { label: '自定义渲染', value: 'Box', render: '() => <Box></Box>' },
];

/**
 * Render Props Setters
 */
export function RenderSetter({
  value,
  onChange,
  text = '自定义渲染为',
  options = defaultOptions,
  template = `() => {{content}}`,
  fallbackOption,
}: FormItemComponentProps & RenderSetterProps) {
  const [inputValue, setInputValue] = useState(value || '');
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const optionsMap = useMemo(() => {
    return options.reduce<Dict>((prev, cur) => {
      prev[cur.value] = cur;
      return prev;
    }, {});
  }, [options]);

  const onSelect = useCallback(
    (key: string) => {
      const option = optionsMap[key] || fallbackOption;
      const next = option?.render || getCallbackValue(option.renderBody, template);
      if (next) {
        onChange(next, { relatedImports: option.relatedImports });
      } else {
        onChange(undefined);
      }
    },
    [optionsMap, fallbackOption, onChange, template],
  );
  return (
    <Box>
      <ActionSelect text={text} options={options} onSelect={onSelect} />
      {inputValue && (
        <InputCode
          value={inputValue}
          onChange={(val) => setInputValue(val)}
          onBlur={() => onChange(inputValue)}
        />
      )}
    </Box>
  );
}
