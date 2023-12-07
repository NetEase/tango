import React from 'react';
import { createIcon } from './create-icon';

const RedoOutlinedSvg = () => (
  <svg
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m12 10h12.1851l-3.5874-3.5859 1.4023-1.4141 6 6-6 6-1.4023-1.4146 3.5844-3.5854h-12.1821a6 6 0 0 0 0 12h8v2h-8a8 8 0 0 1 0-16z" />
  </svg>
);

export const RedoOutlined = createIcon(RedoOutlinedSvg, 'RedoOutlined');
