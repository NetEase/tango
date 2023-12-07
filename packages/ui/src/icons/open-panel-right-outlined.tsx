import React from 'react';
import { createIcon } from './create-icon';

const OpenPanelRightOutlinedSvg = () => (
  <svg
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m28 4h-24a2 2 0 0 0 -2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-20a2 2 0 0 0 -2-2zm-24 2h16v20h-16zm24 20h-6v-20h6z" />
    <path d="m0 0h32v32h-32z" fill="none" />
  </svg>
);

export const OpenPanelRightOutlined = createIcon(
  OpenPanelRightOutlinedSvg,
  'OpenPanelRightOutlined',
);
