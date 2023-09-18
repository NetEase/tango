import React from 'react';
import { FormItemComponentProps } from './form-item';

// FIXME: 内置 ExpressionSetter，默认全部 fallback 到此 setter
export function ExpressionSetter(props: FormItemComponentProps<string>) {
  return <div>exp setter</div>;
}
