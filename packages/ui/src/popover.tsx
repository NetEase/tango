import React, { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { noop } from '@music163/tango-helpers';
import { Box } from 'coral-system';

export interface PopoverProps {
  open?: boolean;
  /**
   * 浮层内容
   */
  overlay: React.ReactNode;
  /**
   * 浮层打开或关闭时的回调
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 浮层被遮挡时自动调整位置
   */
  autoAdjustOverflow?: boolean;
  /**
   * 点击蒙层是否允许关闭
   */
  maskClosable?: boolean;
  /**
   * 手动唤起时的位置
   */
  left?: number;
  /**
   * 手动唤起时的位置
   */
  top?: number;
  /**
   * z-index
   */
  zIndex?: number;
  /**
   * popoverStyle
   */
  popoverStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({
  open,
  overlay,
  maskClosable = false,
  autoAdjustOverflow = true,
  left: controlledLeft,
  top: controlledTop,
  children,
  popoverStyle,
  onOpenChange = noop,
  zIndex = 9999,
}) => {
  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 唤起位置受控
  const isControlledPostion = useMemo(
    () => controlledLeft !== undefined || controlledTop !== undefined,
    [controlledLeft, controlledTop],
  );

  useEffect(() => {
    if (typeof controlledTop === 'number') {
      setTop(controlledTop);
    }
    if (typeof controlledLeft === 'number') {
      setLeft(controlledLeft);
    }
  }, [controlledTop, controlledLeft]);

  useLayoutEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        maskClosable &&
        visible &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
        onOpenChange(false);
      }
    };

    if (maskClosable && visible) {
      document.addEventListener('click', handleDocumentClick, true);
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [maskClosable, onOpenChange, visible]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      setLeft(x);
      setTop(y + 10);
      setVisible(true);
      onOpenChange(true);
    },
    [onOpenChange],
  );

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const getAdjustedPosition = () => {
    const popoverElement = popoverRef.current;
    if (popoverElement) {
      const popoverRect = popoverElement.getBoundingClientRect();
      if (popoverRect.right > window.innerWidth) {
        setLeft(window.innerWidth - popoverRect.width);
      }
      if (popoverRect.bottom > window.innerHeight) {
        setTop(window.innerHeight - popoverRect.height);
      }
    }
  };

  useEffect(() => {
    if (visible && autoAdjustOverflow) {
      getAdjustedPosition();
    }
  }, [visible, autoAdjustOverflow]);

  const overlayStyle: React.CSSProperties = useMemo(
    () => ({
      display: visible ? 'block' : 'none',
      position: 'fixed',
      left,
      top,
      zIndex,
      ...popoverStyle,
    }),
    [left, popoverStyle, top, visible, zIndex],
  );

  const overlayDom = (
    <Box className="popover">
      <Box ref={popoverRef} className="overlay" style={overlayStyle}>
        {overlay}
      </Box>
    </Box>
  );

  return (
    <>
      {!isControlledPostion &&
        React.cloneElement(children as any, {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            handleClick(e);
            (children as any).props?.onClick?.(e);
          },
        })}
      {visible ? ReactDOM.createPortal(overlayDom, document.body) : null}
    </>
  );
};
