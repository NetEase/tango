import React from 'react';
import { createIcon } from './create-icon';

const CodeOutlinedSvg = () => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="currentColor"
  >
    <path d="m31 16-7 7-1.41-1.41 5.58-5.59-5.58-5.59 1.41-1.41z" />
    <path d="m1 16 7-7 1.41 1.41-5.58 5.59 5.58 5.59-1.41 1.41z" />
    <path
      d="m5.91 15h20.17v2h-20.17z"
      transform="matrix(.25881905 -.96592583 .96592583 .25881905 -3.6 27.31)"
    />
    <path d="m0 0h32v32h-32z" fill="none" transform="matrix(0 -1 1 0 0 32)" />
  </svg>
);

export const CodeOutlined = createIcon(CodeOutlinedSvg, 'CodeOutlined');
