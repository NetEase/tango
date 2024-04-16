import React, { StrictMode } from 'react';
import { Outlet } from 'umi';
import './index.less';

export default function Layout() {
  return (
    <StrictMode>
      <Outlet />
    </StrictMode>
  );
}
