import React from 'react';
import { Box, HTMLCoralProps } from 'coral-system';
import { Input, Switch, Select } from 'antd';
import { SelectList } from './select-list';

/**
 * 配置组
 */
export function ConfigGroup({
  title,
  children,
}: {
  title?: string | React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Box className="SettingGroup" mb="l">
      <Box
        className="SettingGroupTitle"
        fontSize="14px"
        fontWeight="bold"
        borderBottom="solid"
        borderBottomColor="#f0f0f0"
        px="l"
        py="s"
      >
        {title}
      </Box>
      <Box className="SettingGroupChildren" px="l">
        {children}
      </Box>
    </Box>
  );
}

const builtinConfigSetterMap = {
  switch: ({ value, onChange, ...rest }: any) => {
    return <Switch {...rest} checked={value} onChange={onChange} />;
  },
  input: ({ value, onChange, ...rest }: any) => {
    return <Input {...rest} value={value} onBlur={(e) => onChange(e.target.value)} />;
  },
  select: Select,
  selectList: SelectList,
};

type LayoutDirectionType = 'row' | 'column';

/**
 * 配置项
 */
export function ConfigItem({
  title,
  description,
  children: childrenProp,
  layoutDirection = 'row',
  component,
  componentProps = {},
  onChange,
  value,
}: {
  title?: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  component?: 'switch' | 'input' | 'select' | 'selectList';
  componentProps?: object;
  /**
   * 布局方向
   */
  layoutDirection?: LayoutDirectionType;
  value?: any;
  onChange?: (val: any) => any;
}) {
  let children = childrenProp;
  const Setter = builtinConfigSetterMap[component];
  if (Setter) {
    children = <Setter {...componentProps} value={value} onChange={onChange} />;
  }
  const { rootStyle, leftStyle, rightStyle } = useConfigItemStyle(layoutDirection);

  return (
    <Box
      className="SettingItem"
      py="m"
      borderBottom="solid"
      borderBottomColor="#f0f0f0"
      {...rootStyle}
    >
      <Box className="SettingItemLeft" {...leftStyle}>
        <Box className="SettingItemTitle" fontSize="14px" fontWeight="bold" mb="s">
          {title}
        </Box>
        <Box className="SettingItemDescription" fontSize="12px" color="text.note">
          {description}
        </Box>
      </Box>
      <Box className="SettingItemRight" {...rightStyle}>
        {children}
      </Box>
    </Box>
  );
}

function useConfigItemStyle(layoutDirection: LayoutDirectionType) {
  let rootStyle: HTMLCoralProps<'div'>;
  let leftStyle: HTMLCoralProps<'div'>;
  let rightStyle: HTMLCoralProps<'div'>;

  if (layoutDirection === 'row') {
    rootStyle = {
      display: 'flex',
      alignItems: 'center',
    };
    leftStyle = {
      width: '60%',
    };
    rightStyle = {
      width: '40%',
      display: 'flex',
      justifyContent: 'flex-end',
    };
  } else if (layoutDirection === 'column') {
    rootStyle = {
      display: 'flex',
      flexDirection: 'column',
    };
  }

  return {
    rootStyle,
    leftStyle,
    rightStyle,
  };
}
