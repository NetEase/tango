import React, { useState } from 'react';
import { css, Box, HTMLCoralProps, Text } from 'coral-system';
import { Checkbox, Tooltip } from 'antd';
import { CollapsePanel } from '@music163/tango-ui';
import { isNil, isString } from '@music163/tango-helpers';

export interface FormControlProps extends Omit<FormLabelProps, 'type'> {
  visible: boolean;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  error?: string;
  children?: React.ReactNode;
}

export function FormControl({
  visible,
  label,
  note,
  tip,
  docs,
  extra,
  footer,
  error,
  children,
  ...rest
}: FormControlProps) {
  return (
    <Box className="FormControl" display={visible ? 'block' : 'none'} {...rest}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="s">
        <FormLabel label={label} note={note} tip={tip} docs={docs} />
        {extra}
      </Box>
      <Box>{children}</Box>
      {footer}
      {!!error && (
        <Box mt="m" color="red">
          {error}
        </Box>
      )}
    </Box>
  );
}

const formControlGroupContentStyle = css`
  > .FormControlGroup {
    border-style: solid;
    border-width: 1px;
  }
`;

export interface FormControlGroupProps extends FormLabelProps {
  error?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  /**
   * 勾选变化时的回调
   */
  onCheck?: (checked: boolean) => void;
  /**
   * 是否勾选
   */
  checked?: boolean;
  /**
   * checkbox 默认是否勾选
   */
  defaultChecked?: boolean;
}

export function FormControlGroup({
  label,
  note,
  tip,
  docs,
  error,
  extra,
  children,
  onCheck,
  checked,
  defaultChecked = false,
}: FormControlGroupProps) {
  const [collapsed, setCollapsed] = useState(isNil(checked) ? !defaultChecked : !checked);
  return (
    <CollapsePanel
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="FormControlGroup"
      title={
        <Box display="flex" columnGap="s">
          <Checkbox
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              const nextChecked = e.target.checked;
              setCollapsed(!nextChecked);
              onCheck?.(nextChecked);
            }}
          />
          <FormLabel type="secondary" label={label} note={note} tip={tip} docs={docs} />
        </Box>
      }
      extra={
        <Box flex="1" textAlign="right">
          {extra}
        </Box>
      }
      border="solid"
      borderColor="line.normal"
      headerProps={{
        bg: 'fill1',
      }}
    >
      <Box
        p="m"
        display="flex"
        flexDirection="column"
        rowGap="l"
        css={formControlGroupContentStyle}
      >
        {children}
      </Box>
      <Box color="red">{error}</Box>
    </CollapsePanel>
  );
}

const labelStyle = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
  vertical-align: bottom;
  user-select: none;

  &.hasHelp {
    border-bottom: 1px dashed var(--tango-colors-text-normal);
  }
`;

const tipStyle = css`
  a:link {
    color: #fff;
  }

  a:hover {
    color: var(--tango-colors-brand);
  }
`;

interface FormLabelProps extends HTMLCoralProps<'div'> {
  /**
   * 类型
   */
  // eslint-disable-next-line react/no-unused-prop-types
  type?: 'normal' | 'secondary';
  /**
   * 标签
   */
  label?: string;
  /**
   * 备注
   */
  note?: string;
  /**
   * 冒泡信息
   */
  tip?: string;
  /**
   * 文档地址
   */
  docs?: string;
}

function FormLabel({ type = 'normal', label, note, tip, docs, ...rest }: FormLabelProps) {
  const help = docs ? (
    <Box css={tipStyle}>
      <Text mr="m">{tip}</Text>
      <a href={docs} target="_blank" rel="noreferrer">
        帮助文档
      </a>
    </Box>
  ) : (
    tip
  );

  const labelColor = {
    normal: 'text.body',
    secondary: 'text.note',
  }[type];

  let labelNode = (
    <Box
      as="span"
      display="inline-block"
      color={labelColor}
      className={help ? 'hasHelp' : ''}
      css={labelStyle}
      title={isString(label) ? label : undefined}
    >
      {label}
    </Box>
  );

  if (help) {
    labelNode = <Tooltip title={help}>{labelNode}</Tooltip>;
  }

  return (
    <Box fontSize="14px" {...rest}>
      {labelNode}
      {note && (
        <Box as="i" display="inline-block" fontSize="12px" color="text.note" ml="m">
          {note}
        </Box>
      )}
    </Box>
  );
}

interface FieldSetProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

export function FieldSet({ title, extra, children }: FieldSetProps) {
  return (
    <CollapsePanel title={title} extra={extra}>
      <Box px="m">{children}</Box>
    </CollapsePanel>
  );
}
