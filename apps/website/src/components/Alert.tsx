import React, { useState } from 'react';

export interface AlertProps {
  type?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  closeable?: boolean;
  children: React.ReactNode;
}

export function Alert({ type = 'primary', closeable, children }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return <div className="alert" role="alert" />;
  }
  return (
    <div className={`alert alert--${type}`} role="alert">
      {closeable && (
        <button
          aria-label="Close"
          className="clean-btn close"
          type="button"
          onClick={() => setVisible(false)}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {children}
    </div>
  );
}
