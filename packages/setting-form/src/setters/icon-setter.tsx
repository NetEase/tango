import React from 'react';
import { css } from 'styled-components';
import { Box } from 'coral-system';
import { Select } from 'antd';
// import { IconPro } from '@ant-design/icons';
import { FormItemComponentProps } from '../form-item';

const acStyle = css`
  .ant-select {
    width: 100%;
  }
`;

const ALL_ICON_NAMES: string[] = [];

/**
 * Icon 组件设置器
 * onChange 返回 `{<Icon type="iconName" />}`
 */
export function IconSetter({ onChange, ...rest }: FormItemComponentProps) {
  const handleChange = (val: string) => {
    onChange &&
      onChange(val, {
        relatedImports: ['Icon'],
      });
  };
  return (
    <Box css={acStyle}>
      <Select showSearch allowClear placeholder="请选择图标" onChange={handleChange} {...rest}>
        {ALL_ICON_NAMES.map((icon) => {
          const key = `{<Icon type="${icon}" />}`;
          return (
            <Select.Option key={key}>
              <Box display="inline-block" mr="m">
                {/* <IconPro type={icon as any} size="14px" /> */}
              </Box>
              {icon}
            </Select.Option>
          );
        })}
      </Select>
    </Box>
  );
}
