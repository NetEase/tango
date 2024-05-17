import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

export interface PopoverProps {
  open?: boolean;
  //   浮层内容
  overlay: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  /**
   * 浮层被遮挡时自动调整位置
   */
  autoAdjustOverflow?: boolean;
  left?: number;
  top?: number;
  zIndex?: number;
}

export const Popover: React.FC<PopoverProps> = ({
  open,
  overlay,
  onOpenChange,
  autoAdjustOverflow = true,
  left: controlledLeft,
  top: controlledTop,
  children,
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
    if (typeof controlledLeft === 'number') {
      setLeft(controlledLeft);
    }
  }, [controlledLeft]);

  useEffect(() => {
    if (typeof controlledTop === 'number') {
      setTop(controlledTop);
    }
  }, [controlledTop]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    setLeft(x);
    setTop(y + 10);
    setVisible(true);
    onOpenChange(true);
  };

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

  const popoverStyle: React.CSSProperties = {
    display: visible ? 'block' : 'none',
    position: 'fixed',
    left,
    top,
    zIndex,
  };

  const overlayDom = (
    <div className="popover">
      <div ref={popoverRef} className="overlay" style={popoverStyle}>
        {overlay}
      </div>
    </div>
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
