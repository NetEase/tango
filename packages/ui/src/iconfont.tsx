import React from 'react';
import Icon from '@ant-design/icons';
import type { IconFontProps } from '@ant-design/icons/es/components/IconFont';

/**
 * 只能在 Designer 里面用，其他地方用不了，依赖 iconfont 脚本提前载入
 */
export function IconFont(props: IconFontProps<string>) {
  const { type, children, ...restProps } = props;

  // children > type
  let content: React.ReactNode = null;
  if (props.type) {
    content = <use xlinkHref={`#${type}`} />;
  }
  if (children) {
    content = children;
  }
  return <Icon {...(restProps as any)}>{content}</Icon>;
}

IconFont.displayName = 'IconFont';
