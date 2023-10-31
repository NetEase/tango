import React from 'react';
import { Box, HTMLCoralProps, css } from 'coral-system';
import { UpOutlined } from '@ant-design/icons';
import { useControllableState } from '@music163/tango-helpers';

export interface CollapsePanelProps extends Omit<HTMLCoralProps<'div'>, 'title'> {
  /**
   * 标题
   */
  title?: React.ReactNode;
  /**
   * 标题附加内容
   */
  extra?: React.ReactNode;
  /**
   * 是否固定在顶部
   */
  stickyHeader?: boolean;
  /**
   * 默认是否收起
   */
  defaultCollapsed?: boolean;
  /**
   * 受控的折叠状态
   */
  collapsed?: boolean;
  /**
   * 折叠状态变化时的回调
   */
  onCollapse?: (collapse: boolean) => void;
  /**
   * 是否显示底部边框线
   */
  showBottomBorder?: boolean;
}

const headerStyle = css`
  user-select: none;

  .anticon-up {
    margin-right: 8px;
    color: var(--tango-colors-text2);
    transition: transform 0.2s ease 0s;
  }
`;

export function CollapsePanel(props: CollapsePanelProps) {
  const {
    title,
    extra,
    children,
    collapsed: collapsedProp,
    defaultCollapsed = false,
    onCollapse,
    stickyHeader,
    showBottomBorder = true,
    ...rest
  } = props;
  const [collapsed, setCollapsed] = useControllableState({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onChange: onCollapse,
  });

  const iconStyle = {
    transform: collapsed ? undefined : 'rotate(-180deg)',
  };

  const stickHeaderProps: HTMLCoralProps<'div'> = stickyHeader
    ? {
        position: 'sticky',
        top: '0px',
        zIndex: 1,
        bg: 'white',
      }
    : {};

  const CollapsePanelBorderStyle = showBottomBorder
    ? {
        borderBottom: 'solid',
        borderBottomColor: 'line2',
      }
    : {};

  return (
    <Box className="CollapsePanel" {...CollapsePanelBorderStyle} {...rest}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        className="CollapsePanelHeader"
        onClick={() => setCollapsed(!collapsed)}
        p="m"
        {...stickHeaderProps}
        css={headerStyle}
      >
        <Box display="flex" alignItems="center" fontSize="14px" fontWeight="500">
          <UpOutlined style={iconStyle} />
          {title}
        </Box>
        <Box>{extra}</Box>
      </Box>
      <Box className="CollapsePanelBody" display={collapsed ? 'none' : 'block'}>
        {children}
      </Box>
    </Box>
  );
}
