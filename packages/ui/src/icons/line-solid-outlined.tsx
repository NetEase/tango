import React from 'react';
import { createIcon } from './create-icon';

const LineSolidOutlinedSvg = () => (
  <svg
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="currentColor"
  >
    <path d="M141.21142578 496.55047632h741.57714844v30.89904736H141.21142578z" />
  </svg>
);

export const LineSolidOutlined = createIcon(LineSolidOutlinedSvg, 'LineSolidOutlined');
