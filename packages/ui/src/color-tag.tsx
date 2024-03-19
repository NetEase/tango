import { Tag, TagProps, Tooltip } from 'antd';
import React from 'react';

interface ColorTagProps extends TagProps {
  tooltip?: string;
}

export function ColorTag({ tooltip, children, ...rest }: ColorTagProps) {
  const tag = <Tag {...rest}>{children}</Tag>;
  if (tooltip) {
    return <Tooltip title={tooltip}>{tag}</Tooltip>;
  }
  return tag;
}
