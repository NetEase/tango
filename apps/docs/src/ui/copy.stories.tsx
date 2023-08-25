import React from 'react';
import { CopyClipboard } from '@music163/tango-ui';

export default {
  title: 'UI/Copy',
};

export function Basic() {
  return (
    <CopyClipboard text="hello">
      {(copied) => <button>{copied ? 'copied' : 'copy'}</button>}
    </CopyClipboard>
  );
}
