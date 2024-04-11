import React from 'react';
import { createIcon } from './create-icon';

const DualOutlinedSvg = () => (
  <svg
    viewBox="0 0 1025 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="currentColor"
  >
    <path d="M912 64H112c-26.5 0-48 21.5-48 48v800c0 26.5 21.5 48 48 48h800c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM136 193h340v695H136V193z m412 695V193h340v695H548z" />
  </svg>
);

export const DualOutlined = createIcon(DualOutlinedSvg, 'DualOutlined');
