import React, { useState } from 'react';
import { ClassNameInput } from '@music163/tango-ui';

export default {
  title: 'UI/ClassNameInput',
};

export function Basic() {
  return <ClassNameInput defaultValue="hello world" onChange={console.log} />;
}

export function Controlled() {
  const [value, setValue] = useState('');
  return <ClassNameInput value={value} onChange={setValue} />;
}
