import React from 'react';
import { Button, Link, css, HTMLCoralProps } from 'coral-system';
import { Tooltip } from 'antd';

const btnStyle = css`
  &:hover {
    color: var(--tango-colors-brand);
  }
`;

export interface IconButtonProps extends HTMLCoralProps<'button'> {
  /**
   * 图标
   */
  icon?: React.ReactNode;
  /**
   * 气泡提示
   */
  tooltip?: string;
  /**
   * 点击跳转的链接地址
   */
  href?: string;
}

export function IconButton({ tooltip, icon, href, children, ...rest }: IconButtonProps) {
  const btn = href ? (
    <Link href={href} target="_blank" color="text2" css={btnStyle} {...(rest as any)}>
      {icon ?? children}
    </Link>
  ) : (
    <Button border="0" bg="transparent" color="text2" px="s" css={btnStyle} {...rest}>
      {icon ?? children}
    </Button>
  );
  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="topRight">
        {btn}
      </Tooltip>
    );
  }
  return btn;
}
