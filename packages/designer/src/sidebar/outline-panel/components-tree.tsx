import React, { useEffect, useState } from 'react';
import { Dropdown, Space, Tree } from 'antd';
import { Box, css } from 'coral-system';
import { IconFont } from '@music163/tango-ui';
import { EyeOutlined, EyeInvisibleOutlined, EllipsisOutlined } from '@ant-design/icons';
import { observer, useWorkspace } from '@music163/tango-context';
import { DropMethod, IViewNodeData } from '@music163/tango-core';
import { noop, parseDndId } from '@music163/tango-helpers';
import { useSandboxQuery } from '../../context';
import { buildQueryBySlotId } from '../../helpers';
import { ContextMenu } from '../../components';

export interface ComponentsTreeProps {
  /**
   * 显示/隐藏组件按钮,默认显示
   */
  showToggleVisibleIcon?: boolean;
  /**
   * 页面节点选中回调
   */
  onSelect?: (nodeKey: string) => void;
  /**
   * 节点树更多功能菜单
   */
  actionItems?: ActionItem[];
}

interface ActionItem {
  item: React.ReactNode;
  key: string;
}

const outlineStyle = css`
  .ant-tree-title {
    color: rgb(85, 85, 85);
  }

  .ant-tree .ant-tree-treenode {
    padding: 2px;
  }

  .ant-tree-indent-unit {
    width: 12px;
  }

  .ant-tree .ant-tree-node-content-wrapper {
    white-space: nowrap;
    transition: none;
  }
  .variable-row {
    font-size: 12px;
  }
  .ant-tree-switcher-noop {
    display: none;
  }
  .material-icon {
    width: 1em;
    height: 1em;
  }
`;

const filedNames = {
  title: 'component',
  key: 'id',
  children: 'children',
};

const getNodeKeys = (data: IViewNodeData[]) => {
  const ids: string[] = [];
  data?.forEach((node) => {
    ids.push(node.id);
    if (node.children) {
      ids.push(...getNodeKeys(node.children));
    }
  });
  return ids;
};

const OutlineTreeNode: React.FC<{ node: IViewNodeData } & ComponentsTreeProps> = observer(
  ({ node, showToggleVisibleIcon, actionItems }) => {
    const workspace = useWorkspace();
    const sandboxQuery = useSandboxQuery();
    const [visible, setVisible] = useState(true);
    const nodeLabel = (() => {
      const { codeId } = parseDndId(node.id);
      return codeId;
    })();
    const componentPrototype = workspace.componentPrototypes.get(node.component);
    const icon = componentPrototype?.icon || 'icon-placeholder';

    const iconRender = icon.startsWith('icon-') ? (
      <IconFont className="material-icon" type={icon} />
    ) : (
      <img className="material-icon" src={icon} alt={componentPrototype.name} />
    );

    const toggleVisible = (nodeId: string) => {
      sandboxQuery.getElement(buildQueryBySlotId(nodeId)).style.visibility = visible
        ? 'hidden'
        : 'visible';
      setVisible(!visible);
    };

    const VisibleIcon = visible ? EyeOutlined : EyeInvisibleOutlined;
    return (
      <Space>
        {iconRender} {nodeLabel}
        {/* 切换显示 */}
        {showToggleVisibleIcon && (
          <VisibleIcon
            className="material-icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleVisible(node.id);
            }}
          />
        )}
        {/* 更多 ... 功能菜单 */}
        {actionItems?.length > 0 && (
          <Dropdown
            menu={{
              items: actionItems.map((_) => ({
                key: _.key,
                label: _.item,
              })),
            }}
            trigger={['click']}
          >
            <EllipsisOutlined />
          </Dropdown>
        )}
      </Space>
    );
  },
);

export const ComponentsTree: React.FC<ComponentsTreeProps> = observer(
  ({ showToggleVisibleIcon = true, onSelect = noop, actionItems }) => {
    const workspace = useWorkspace();
    const sandboxQuery = useSandboxQuery();
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(
      workspace.selectSource.selected.map((item) => item.id),
    );
    const file = workspace.activeViewModule;
    const nodesTree = (file?.nodesTree ?? []) as IViewNodeData[];
    const [expandedKeys, setExpandedKeys] = useState(getNodeKeys(nodesTree));
    const [contextMenuOpen, setContextMenuOpen] = useState(false);

    const handleSelect = (keys: React.Key[]) => {
      const slotKey = keys?.[0] as string;
      const data = sandboxQuery.getDraggableParentsData(buildQueryBySlotId(slotKey), true);
      if (data && data.id) {
        workspace.selectSource.select(data);
      }
      // export selected
      onSelect(slotKey);
      setSelectedKeys(keys);
    };

    useEffect(() => {
      setSelectedKeys(workspace.selectSource.selected.map((item) => item.id));
    }, [workspace.selectSource.selected]);

    useEffect(() => {
      setExpandedKeys(getNodeKeys(nodesTree));
      // nodeTree 更新后重新计算expandKeys
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodesTree?.[0]?.id]);

    if (!nodesTree.length) {
      return (
        <Box>
          没有指定文件，或文件<code>{workspace.activeViewFile}</code>没有有效的节点树
        </Box>
      );
    }

    return (
      <Box css={outlineStyle}>
        <Dropdown
          placement="bottomLeft"
          trigger={['contextMenu']}
          open={contextMenuOpen}
          onOpenChange={(val) => {
            if (!val) {
              setContextMenuOpen(val);
            }
          }}
          overlay={<ContextMenu onClick={() => setContextMenuOpen(false)} showParents={false} />}
        >
          <Tree
            selectedKeys={selectedKeys as string[]}
            fieldNames={filedNames}
            treeData={nodesTree as any[]}
            onSelect={handleSelect}
            blockNode
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            draggable
            onDragStart={(data) => {
              const prototype = workspace.componentPrototypes.get(data.node.component);
              if (!prototype) {
                return;
              }
              const { canDrag } = prototype.rules || {};
              if (canDrag && !canDrag()) {
                return;
              }
              workspace.dragSource.set({
                id: data.node.id,
                name: data.node.component,
              });
            }}
            onDrop={(data) => {
              const dropKey = data.node.key as string;
              let method;
              if (data.dropToGap) {
                // 插入节点的后面
                method = DropMethod.InsertAfter;
              } else {
                // 作为第一个子节点
                method = DropMethod.InsertFirstChild;
              }
              workspace.dragSource.dropTarget.set(
                {
                  id: dropKey,
                },
                method,
              );
              workspace.dropNode();
            }}
            onRightClick={({ event, node }) => {
              // 按下其他按键时，视为用户有特殊操作，此时不展示右键菜单
              if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
                setContextMenuOpen(false);
                return;
              }
              // 顶层的 Page 组件不展示右键菜单
              if (node.component === 'Page') {
                setContextMenuOpen(false);
                return;
              }
              event.preventDefault();
              // 由于部分操作是基于 selectSource 实现的，因此右键时默认选中当前项
              handleSelect([node.key]);
              setContextMenuOpen(true);
            }}
            titleRender={(node) => (
              <OutlineTreeNode
                actionItems={actionItems}
                showToggleVisibleIcon={showToggleVisibleIcon}
                node={node}
              />
            )}
          />
        </Dropdown>
      </Box>
    );
  },
);
