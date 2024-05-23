import React from 'react';
import { getWidget } from '../widgets';
import { Menu, MenuProps } from 'antd';
import { observer, useWorkspace } from '@music163/tango-context';
import { ISelectedItemData, isString } from '@music163/tango-helpers';
import { Box, css } from 'coral-system';
import { IconFont } from '@music163/tango-ui';

const contextMenuStyle = css`
  .ant-dropdown-menu {
    width: 240px;
  }

  .ant-dropdown-menu-title-content {
    padding-left: 20px;
  }

  .ant-dropdown-menu-item-icon + .ant-dropdown-menu-title-content {
    padding-left: 0;
  }

  .ant-dropdown-menu-submenu-popup {
    padding: 0;
    margin-top: -4px;
  }
`;

const ParentNodesMenuItem = ({
  record,
  onClick,
  key,
}: {
  record: ISelectedItemData;
  onClick: () => any;
  key?: string;
}) => {
  const workspace = useWorkspace();
  const componentPrototype = workspace.componentPrototypes.get(record.name);
  const icon = componentPrototype?.icon || 'icon-placeholder';

  const iconRender = icon.startsWith('icon-') ? (
    <IconFont className="material-icon" type={icon} />
  ) : (
    <img className="material-icon" src={icon} alt={componentPrototype.name} />
  );

  return (
    <Menu.Item key={key || record.id} icon={iconRender} onClick={onClick}>
      {record.name}
      {!!record.codeId && ` (${record.codeId})`}
    </Menu.Item>
  );
};

const ParentNodesMenu = observer(() => {
  const workspace = useWorkspace();
  const selectSource = workspace.selectSource;
  const parents = selectSource.first?.parents;

  if (!parents?.length) {
    return null;
  }

  return (
    <Menu.SubMenu key="parentNodes" title="选取父节点">
      {parents.map((item, index) => (
        <ParentNodesMenuItem
          key={item.id}
          record={item}
          onClick={() => {
            selectSource.select({
              ...item,
              parents: parents.slice(index + 1),
            });
          }}
        />
      ))}
    </Menu.SubMenu>
  );
});

export interface ContextMenuProps extends MenuProps {
  /**
   * 动作列表，默认列出全部
   */
  actions?: Array<string | React.ReactElement>;
  /**
   * 是否显示父节点选项
   */
  showParents?: boolean;
  className?: string;
  style?: React.CSSProperties;
  menuStyle?: React.CSSProperties;
}

export const ContextMenu = observer(
  ({
    showParents,
    actions: actionsProp,
    className,
    style,
    menuStyle,
    ...rest
  }: ContextMenuProps) => {
    const actions = actionsProp || Object.keys(getWidget('contextMenu'));
    const menus = actions.map((item) => {
      if (isString(item)) {
        const widget = getWidget(['contextMenu', item].join('.'));
        return widget ? React.createElement(widget) : null;
      }
      return item;
    });
    if (showParents) {
      menus.unshift(<ParentNodesMenu />);
    }

    return (
      <Box display="inline-block" css={contextMenuStyle} className={className} style={style}>
        <Menu activeKey={null} {...rest} style={menuStyle}>
          {menus}
        </Menu>
      </Box>
    );
  },
);
