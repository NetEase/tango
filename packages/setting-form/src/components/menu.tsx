import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

const Text = styled.div`
  background-color: #8fa0f0;
  color: white;
  padding: 2px 4px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  background-color: white;
  border: 1px solid #d9d9d9;
  margin: 0 4px;
  position: absolute;
  width: calc(100% - 8px);
  max-width: 300px;

  > li {
    .group-title {
      color: #666;
      margin: 8px 0 4px;
      padding: 0 4px;
    }

    .action-item {
      line-height: 22px;
      padding: 0 4px;
      user-select: none;

      &:hover {
        cursor: pointer;
      }

      &.active {
        background-color: #8fa0f0;
        color: white;
      }
    }
  }
`;

let timer: any;

export interface MenuProps {
  text?: string;
  items?: Array<{
    title?: string;
    label?: string;
    key?: string;
  }>;
  value?: string;
  onClick?: (key: string) => void;
  showDefaultText?: boolean;
  top?: string;
  onUpdate?: Function;
}

export const Menu = (props: MenuProps) => {
  const {
    text = '输入 {} 进入指令选择界面',
    showDefaultText = true,
    items = [],
    value,
    onClick,
    onUpdate,
    top,
  } = props;

  const handleClick = (ev: any, item: Record<string, any>) => {
    ev.stopPropagation();

    item?.key.indexOf('.') > -1 && onUpdate(item?.key);

    timer && clearTimeout(timer);

    timer = setTimeout(() => {
      onClick?.(item?.key);
    }, 0);
  };

  const renderItems = () => {
    return items.map((item, idx) => {
      const { label, title, key } = item;
      const newClass = classnames('action-item', { active: value === key });

      return (
        <li key={idx}>
          {title && <div className="group-title">{title}</div>}
          <div className={newClass} onClick={(ev) => handleClick(ev, item)}>
            {label}
          </div>
        </li>
      );
    });
  };

  const children = showDefaultText ? <Text>{text}</Text> : renderItems();

  return <List style={{ top }}>{children}</List>;
};
