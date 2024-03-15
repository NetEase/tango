import React, { useEffect, useState } from 'react';
import { Box } from 'coral-system';
import { Input, Radio } from 'antd';
import { isValidUrl } from '@music163/tango-helpers';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { useWorkspaceData } from '@music163/tango-context';
import { PickerSetter } from './picker-setter';

export function RouterSetter(props: FormItemComponentProps) {
  const [type, setType] = useState<'input' | 'select'>(() => {
    return isValidUrl(props.value) ? 'input' : 'select';
  });
  const [input, setInput] = useState<string>(props.value);
  const { routeOptions } = useWorkspaceData();

  const displayType = props.type || 'both';
  useEffect(() => {
    displayType === 'router' ? setType('select') : setType('input');
  }, [displayType]);
  return (
    <Box>
      <Box mb="m">
        {['both', 'router'].includes(displayType) && (
          <Radio.Group
            value={type}
            optionType="button"
            buttonStyle="solid"
            onChange={(e) => setType(e.target.value)}
          >
            <Radio value="select">选择路由</Radio>
            <Radio value="input">自定义输入</Radio>
          </Radio.Group>
        )}
      </Box>
      {type === 'select' && (
        <PickerSetter placeholder="请选择本地路由" options={routeOptions} {...props} />
      )}
      {type === 'input' && (
        <Input
          placeholder={`请输入任意${{ link: '链接', router: '路由', both: '' }[displayType]}地址`}
          {...props}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => props?.onChange(input)}
        />
      )}
    </Box>
  );
}
