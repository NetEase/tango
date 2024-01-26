import React from 'react';
import { createIcon } from './create-icon';

const LineDashedOutlinedSvg = () => (
  <svg
    viewBox="0 0 1025 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="currentColor"
  >
    <path d="M212.8 468.8H43.2C17.6 468.8 0 486.4 0 512s17.6 43.2 43.2 43.2h171.2c25.6 0 43.2-17.6 43.2-43.2-1.6-25.6-19.2-43.2-44.8-43.2zM980.8 468.8H811.2c-25.6 0-43.2 17.6-43.2 43.2s17.6 43.2 43.2 43.2h171.2c25.6 0 43.2-17.6 43.2-43.2-1.6-25.6-19.2-43.2-44.8-43.2zM596.8 468.8H427.2c-25.6 0-43.2 17.6-43.2 43.2s17.6 43.2 43.2 43.2h171.2c25.6 0 43.2-17.6 43.2-43.2-1.6-25.6-19.2-43.2-44.8-43.2z" />
  </svg>
);

export const LineDashedOutlined = createIcon(LineDashedOutlinedSvg, 'LineSolidOutlined');
