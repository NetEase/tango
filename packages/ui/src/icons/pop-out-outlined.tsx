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
    <path d="M502.203733 433.3056l85.316267 85.282133 160.512-160.546133 82.875733 82.875733 0.136534-247.483733-249.122134-1.467733 80.827734 80.7936-160.546134 160.546133z m327.424 108.936533l-61.44-62.3104 1.1264 288.221867-512.477866 0.290133 0.512-511.1296 286.651733-1.28-64-64H256c-35.328 0-64 28.672-64 64v512c0 35.328 28.672 64 64 64h512c35.328 0 64-28.672 64-64l-2.372267-225.792z" />
  </svg>
);

export const PopOutOutlined = createIcon(Svg, 'PopOutOutlined');
