import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

export function createIcon(component: React.ComponentType<any>, displayName?: string) {
  const CustomIcon = (props: Partial<CustomIconComponentProps>) => (
    <Icon component={component} {...props} />
  );
  if (displayName) {
    CustomIcon.displayName = displayName;
  }
  return CustomIcon;
}
