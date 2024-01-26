import React from 'react';
import { Radio, RadioProps, Tooltip } from 'antd';
import type { OptionType } from '@music163/tango-helpers';
import { FormItemComponentProps } from '@music163/tango-setting-form';

interface ChoiceSetterProps {
  mode?: 'text' | 'icon';
  options?: OptionType[];
}

export function ChoiceSetter({
  options,
  onChange,
  ...props
}: FormItemComponentProps<string> & ChoiceSetterProps) {
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
          {item.label}
        </RadioButton>
      ))}
    </Radio.Group>
  );
}

function RadioButton({ tip, ...rest }: RadioProps & { tip?: string }) {
  let ret = <Radio.Button {...rest} />;
  if (tip) {
    ret = <Tooltip title={tip}>{ret}</Tooltip>;
  }
  return ret;
}
