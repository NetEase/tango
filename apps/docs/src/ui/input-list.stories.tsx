import React, { useState } from 'react';
import { InputList } from '@music163/tango-ui';

export default {
  title: 'UI/InputList',
};

export function Basic() {
  const [value, setValue] = useState([]);
  return <InputList value={value} onChange={setValue} />;
}
