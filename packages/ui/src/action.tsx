import { Tooltip } from 'antd';
import React from 'react';
import { css, Button, Link, HTMLCoralProps } from 'coral-system';
import cx from 'classnames';

const actionStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  outline: none;
  border: 0;
  border-radius: var(--tango-radii-s);
  color: var(--tango-colors-text2);
  background-color: transparent;

  &:hover {
    background-color: var(--tango-colors-fill2);
  }

  &.small {
    width: 24px;
    height: 24px;
  }

  &.outline {
    background-color: var(--tango-colors-fill1);
  }

  &.outline:hover {
    background-color: var(--tango-colors-fill3);
  }

  &.disabled {
    pointer-events: none;
    color: var(--tango-colors-text4);
  }
`;

export interface ActionProps extends HTMLCoralProps<any> {
  /**
   * 图标
   */
  icon?: React.ReactNode;
  /**
   * 提示文本
   */
  tooltip?: string;
  /**
   * 超链接
   */
  href?: string;
  /**
   * 尺寸
   */
  size?: 'small';
  /**
   * 外观：outline-有边框
   */
  shape?: 'outline';
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 自定义样式
   */
  className?: string;
  children?: React.ReactNode;
}

export function Action({
  icon,
  tooltip,
  href,
  size,
  shape,
  disabled,
  className,
  children,
  ...rest
}: ActionProps) {
  const classNames = cx(
    {
      'tango-action': true,
      'link-action': !!href,
      small: size === 'small',
      outline: shape === 'outline',
      disabled,
    },
    className,
  );

  let ret;
  if (href) {
    ret = (
      <Link className={classNames} css={actionStyle} href={href} isExternal {...rest}>
        {icon ?? children}
      </Link>
    );
  } else {
    ret = (
      <Button type="button" className={classNames} css={actionStyle} {...rest}>
        {icon ?? children}
      </Button>
    );
  }

  if (tooltip) {
    return <Tooltip title={tooltip}>{ret}</Tooltip>;
  }
  return ret;
}
