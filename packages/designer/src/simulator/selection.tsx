import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Box, Button, Group, HTMLCoralProps } from 'coral-system';
import { PlusSquareOutlined, HolderOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ISelectedItemData, isString, noop } from '@music163/tango-helpers';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import { IconButton } from '@music163/tango-ui';
import { getDragGhostElement } from '../helpers';
import { CopyNodeAction, DeleteNodeAction, ViewSourceAction } from '../selection-menu';

/**
 * 选择辅助工具的对齐方式
 */
type SelectionHelperAlignType = 'top-right' | 'top-left' | 'inner-top-right';

const boundingOffset = 100; // 检测选中模块的工具栏是否溢出的偏移值

const internalSelectionTools = {
  source: <ViewSourceAction />,
  copy: <CopyNodeAction />,
  delete: <DeleteNodeAction />,
};

export const INTERNAL_SELECTION_TOOLS = ['source', 'create', 'copy', 'delete'];

export interface SelectionToolsProps {
  /**
   * 动作列表，内置的动作列表有 source-定位到源码, block-创建区块, copy-复制节点, delete-删除节点
   */
  actions?: Array<string | React.ReactElement>;
}

export const SelectionTools = observer(
  ({ actions: actionsProp = INTERNAL_SELECTION_TOOLS }: SelectionToolsProps) => {
    const workspace = useWorkspace();
    const selectSource = workspace.selectSource;
    const actions = actionsProp.map((item) => {
      if (isString(item)) {
        return internalSelectionTools[item]
          ? React.cloneElement(internalSelectionTools[item], { key: item })
          : null;
      }
      return item;
    });
    return (
      <>
        {selectSource.selected.map((item) => (
          <SelectionBox
            key={item.id}
            showActions={selectSource.selected.length === 1}
            actions={actions}
            data={item}
          />
        ))}
      </>
    );
  },
);

const selectionBoxStyle = css`
  display: none;
  border: 2px solid var(--tango-colors-brand);
  pointer-events: none;
  position: absolute;
  z-index: 999; /* 需要比 antd modal(1000) 的层级小 */
  left: 0;
  top: 0;
`;

export interface SelectionBoxProps {
  /**
   * 是否显示操作按钮
   */
  showActions?: boolean;
  /**
   * 动作列表
   */
  actions?: React.ReactElement[];
  /**
   * 选中的数据
   */
  data: ISelectedItemData;
}

function SelectionBox({ showActions, actions, data }: SelectionBoxProps) {
  const workspace = useWorkspace();
  const designer = useDesigner();

  if (!data.bounding) {
    return null;
  }

  if (!data.bounding.height && !data.bounding.width) {
    // 没有尺寸的元素不显示选中框
    return null;
  }

  const prototype = workspace.componentPrototypes.get(data.name);
  const isPage = prototype?.type === 'page';

  // 如果声明了 childrenName，提供快捷子元素创建入口
  let insertedList: ISelectedItemData[] = [];
  if (prototype?.childrenName) {
    const names = Array.isArray(prototype?.childrenName)
      ? prototype.childrenName
      : [prototype.childrenName];
    insertedList = names.map((child) => ({
      id: child,
      name: child,
    }));
  }

  let selectionHelpersAlign: SelectionHelperAlignType = 'top-right';
  if (data.bounding) {
    if (data.bounding.left + data.bounding.width + boundingOffset < designer.viewport.width) {
      // 选中模块已靠近右侧边界位置
      selectionHelpersAlign = 'top-left';
    } else if (data.bounding.top < 20) {
      // 选中模块位于最顶部位置
      selectionHelpersAlign = 'inner-top-right';
    }
  }

  const isFromCurrentFile = data.filename === workspace.activeViewFile;

  let style: React.CSSProperties;
  if (data.bounding) {
    style = {
      display: 'block',
      width: data.bounding.width,
      height: data.bounding.height,
      transform: `translate(${data.bounding.left}px, ${data.bounding.top}px)`,
      ['--color-active' as any]: isFromCurrentFile
        ? 'var(--tango-colors-brand)'
        : 'var(--tango-colors-gray-60)',
      ['--color-active-hover' as any]: isFromCurrentFile
        ? 'var(--tango-colors-primary-50)'
        : 'var(--tango-colors-gray-50)',
    };
  }

  return (
    <Box
      className="AuxSelectionBox"
      data-selection-id={data.id}
      css={selectionBoxStyle}
      style={style}
    >
      {showActions && (
        <SelectionHelpers align={selectionHelpersAlign}>
          <SelectionHelper
            icon={
              !isPage && (
                <HolderOutlined
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    workspace.dragSource.set(data);
                    const ghost = getDragGhostElement();
                    e.dataTransfer.setDragImage(ghost, 0, 0);
                  }}
                  onDragEnd={() => {
                    workspace.dragSource.clear();
                  }}
                />
              )
            }
            label={
              <>
                <NameSelector
                  label={data.name}
                  parents={data.parents}
                  onSelect={(item) => {
                    workspace.selectSource.select(item);
                  }}
                />
                {!isFromCurrentFile && (
                  <IconButton
                    as="span"
                    color="white"
                    tooltip={`该节点来自其他文件（${data.filename}）`}
                    icon={<InfoCircleOutlined />}
                  />
                )}
              </>
            }
          />
          {insertedList.length > 0 && (
            <SelectionHelper
              icon={<PlusSquareOutlined />}
              label={
                insertedList.length === 1 ? (
                  <span
                    onClick={() => {
                      workspace.insertToSelectedNode(insertedList[0].name);
                    }}
                  >
                    添加 {insertedList[0].name}
                  </span>
                ) : (
                  <NameSelector
                    label="添加"
                    parents={insertedList}
                    onSelect={(item) => {
                      workspace.insertToSelectedNode(item.name);
                    }}
                  />
                )
              }
            />
          )}
          <SelectionToolSet>{!isPage && actions}</SelectionToolSet>
        </SelectionHelpers>
      )}
    </Box>
  );
}

const selectionHelpersStyle = css`
  pointer-events: auto;
  white-space: nowrap;
  position: absolute;
  user-select: none;
  column-gap: 2px;

  &[data-align='top-right'] {
    bottom: 100%;
    right: -2px;
  }

  &[data-align='inner-top-right'] {
    top: 0;
    right: 4px;
  }

  &[data-align='top-left'] {
    bottom: 100%;
    left: -2px;
  }
`;

interface SelectionHelpersProps {
  align: SelectionHelperAlignType;
  children?: React.ReactNode;
}

const SelectionHelpers = ({ align = 'top-right', children }: SelectionHelpersProps) => {
  return (
    <Group display="inline-flex" my="s" css={selectionHelpersStyle} data-align={align}>
      {children}
    </Group>
  );
};

const selectionHelperStyle = css`
  outline: none;
  cursor: pointer;
  background: var(--color-active, var(--tango-colors-brand));

  svg {
    margin-right: 4px;
  }

  &:hover {
    background: var(--color-active-hover, var(--tango-colors-primary-50));
  }
`;

interface SelectionHelperProps extends HTMLCoralProps<'button'> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
}

const SelectionHelper = ({ icon, label, children, ...rest }: SelectionHelperProps) => {
  return (
    <Button
      position="relative"
      color="white"
      px="s"
      py="0"
      border="0"
      borderRadius="s"
      fontSize="12px"
      css={selectionHelperStyle}
      {...rest}
    >
      {icon}
      {label}
      {children}
    </Button>
  );
};

const SelectionToolSetStyle = css`
  display: flex;
  align-items: center;
  position: relative;

  > :first-child {
    border-top-left-radius: var(--tango-radii-s);
    border-bottom-left-radius: var(--tango-radii-s);
  }

  > :last-child {
    border-top-right-radius: var(--tango-radii-s);
    border-bottom-right-radius: var(--tango-radii-s);
  }
`;

const SelectionToolSet = ({ children }: HTMLCoralProps<'div'>) => {
  return (
    <Box className="SelectionToolSet" borderRadius="s" css={SelectionToolSetStyle}>
      {children}
    </Box>
  );
};

const slideDown = keyframes`
  from {
    transform: translateY(-10%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 0.8;
  }
`;

const NameSelectorWrapper = styled.div`
  display: inline-block;
  &:hover > ul {
    display: block;
  }

  ul {
    display: none;
    animation: ${slideDown} 0.2s;
    position: absolute;
    left: 0;
    list-style: none;
    padding: 0;
    text-align: left;
  }

  li {
    margin-top: 4px;
  }
`;

interface NameSelectorProps {
  label?: string;
  parents?: ISelectedItemData['parents'];
  onSelect?: (data: ISelectedItemData) => void;
}

const NameSelector = ({ label, parents = [], onSelect = noop }: NameSelectorProps) => {
  return (
    <NameSelectorWrapper>
      <Box as="span" className="SelectionName">
        {label}
      </Box>
      <ul>
        {parents.map((parent, index) => (
          <SelectionHelper
            as="li"
            key={parent.id}
            onClick={() =>
              onSelect({
                ...parent,
                parents: parents.slice(index + 1),
              })
            }
          >
            {parent.name}
          </SelectionHelper>
        ))}
      </ul>
    </NameSelectorWrapper>
  );
};
