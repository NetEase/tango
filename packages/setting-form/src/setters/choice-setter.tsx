import React from 'react';
import { Radio, RadioProps, Tooltip } from 'antd';
import { IconFont } from '@music163/tango-ui';
import type { OptionType } from '@music163/tango-helpers';
import { FormItemComponentProps } from '../form-item';

interface ChoiceSetterProps {
  mode?: 'text' | 'icon';
  options?: OptionType[];
}

function RadioButton({ tip, ...rest }: RadioProps & { tip?: string }) {
  let ret = <Radio.Button {...rest} />;
  if (tip) {
    ret = <Tooltip title={tip}>{ret}</Tooltip>;
  }
  return ret;
}

export function ChoiceSetter({
  options,
  mode = 'text',
  onChange,
  ...props
}: FormItemComponentProps<string> & ChoiceSetterProps) {
  const renderLabel =
    mode === 'text'
      ? (item: OptionType) => item.label
      : (item: OptionType) => <IconFont type={item.icon} />;

  return (
    <Radio.Group
      optionType="button"
      buttonStyle="solid"
      onChange={(e) => {
        onChange && onChange(e.target.value);
      }}
      {...props}
    >
      {options.map((item) => (
        <RadioButton tip={item.tip} key={item.value} value={item.value}>
          {renderLabel(item)}
        </RadioButton>
      ))}
    </Radio.Group>
  );
}
