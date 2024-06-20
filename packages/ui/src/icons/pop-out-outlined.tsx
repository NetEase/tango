import React from 'react';
import { createIcon } from './create-icon';

const Svg = () => (
  <svg
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="currentColor"
  >
    <path d="M832 544a32 32 0 0 1 64 0V832a128 128 0 0 1-128 128H192a128 128 0 0 1-128-128V256a128 128 0 0 1 128-128h288a32 32 0 0 1 0 64H192a64 64 0 0 0-64 64v576a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V544z m-327.68 21.696a32 32 0 1 1-45.184-45.248L851.52 128H672a32 32 0 0 1 0-64H896a64 64 0 0 1 64 64v224a32 32 0 0 1-64 0V174.08L504.32 565.632z" />
  </svg>
);

export const PopOutOutlined = createIcon(Svg, 'PopOutOutlined');
