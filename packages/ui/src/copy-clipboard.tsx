import React, { useEffect, useRef, useState } from 'react';

export interface CopyClipboardProps {
  /**
   * 要拷贝到内容
   */
  text: string;
  /**
   * 拷贝成功后到回调
   */
  onCopy?: () => void;
  children?: React.ReactNode | ((copied: boolean) => React.ReactElement);
}

export function CopyClipboard({ onCopy, text, children }: CopyClipboardProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<any>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  if (typeof children === 'function') {
    return React.cloneElement(children(copied), {
      onClick,
    });
  }
}
