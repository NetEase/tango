import React from 'react';

export function FooSetter({ value, ...rest }: any) {
  return <code {...rest}>fooSetter: {value}</code>;
}
