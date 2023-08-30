import React, { useState } from 'react';
import { SelectList } from '@music163/tango-ui';

export default {
  title: 'UI/SelectList',
};

const options = [
  {
    value: 'alice',
    label: 'Alice',
  },
  {
    value: 'jack',
    label: 'Jack',
  },
  {
    value: 'lucy',
    label: 'Lucy',
  },
  {
    value: 'bob',
    label: 'Bob',
  },
];

export function Basic() {
  const [value, setValue] = useState([]);
  return <SelectList value={value} onChange={setValue} options={options} />;
}

export function UniqueValue() {
  const [value, setValue] = useState([]);
  return <SelectList isUniqueValue value={value} onChange={setValue} options={options} />;
}
