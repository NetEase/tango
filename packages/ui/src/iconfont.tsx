import React from 'react';
import Icon from '@ant-design/icons';
import type { IconFontProps } from '@ant-design/icons/es/components/IconFont';

/**
 * 只能在 Designer 里面用，其他地方用不了，依赖 iconfont 脚本提前载入
 */
export const IconFont = React.forwardRef<HTMLSpanElement, IconFontProps<string>>((props, ref) => {
  const { type, children, ...restProps } = props;

  // children > type
  let content: React.ReactNode = null;
  if (props.type) {
    content = <use xlinkHref={`#${type}`} />;
  }
  if (children) {
    content = children;
  }
  return (
    // @ts-ignore
    <Icon {...restProps} ref={ref}>
      {content}
    </Icon>
  );
});

IconFont.displayName = 'IconFont';
