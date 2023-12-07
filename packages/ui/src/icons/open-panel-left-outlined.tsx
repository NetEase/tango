import React from 'react';
import { createIcon } from './create-icon';

const OpenPanelLeftOutlinedSvg = () => (
  <svg
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m28 4h-24a2 2 0 0 0 -2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-20a2 2 0 0 0 -2-2zm-24 2h6v20h-6zm24 20h-16v-20h16z" />
    <path d="m0 0h32v32h-32z" fill="none" />
  </svg>
);

export const OpenPanelLeftOutlined = createIcon(OpenPanelLeftOutlinedSvg, 'OpenPanelLeftOutlined');
