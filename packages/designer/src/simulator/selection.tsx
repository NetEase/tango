import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Box, Button, Group, HTMLCoralProps } from 'coral-system';
import { Dropdown, DropdownProps, Tooltip } from 'antd';
import { HolderOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { ISelectedItemData, isString, noop } from '@music163/tango-helpers';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import { IconFont } from '@music163/tango-ui';
import { getDragGhostElement } from '../helpers';
import { getWidget } from '../widgets';

/**
 * 选择辅助工具的对齐方式
 */
type SelectionHelperAlignType = 'top-right' | 'top-left' | 'inner-top-right';

const boundingOffset = 100; // 检测选中模块的工具栏是否溢出的偏移值

export interface SelectionToolsProps {
  /**
   * 动作列表，内置的动作列表有 source-定位到源码, block-创建区块, copy-复制节点, delete-删除节点
   */
  actions?: Array<string | React.ReactElement>;
}

export const SelectionTools = observer(
  ({ actions: actionsProp = ['viewSource', 'copyNode', 'deleteNode'] }: SelectionToolsProps) => {
    const workspace = useWorkspace();
    const selectSource = workspace.selectSource;
    const actions = actionsProp.map((item) => {
      if (isString(item)) {
        const widget = getWidget(['selectionMenu', item].join('.'));
        return widget ? React.createElement(widget, { key: item }) : null;
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

const topAddSiblingBtnStyle = css`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 0;
  border-radius: 32px;
  z-index: 999;
  pointer-events: auto;
`;

const bottomAddSiblingBtnStyle = css`
  position: absolute;
  left: 50%;
  transform: translate(-50%, 50%);
  bottom: 0;
  border-radius: 32px;
  z-index: 999;
  pointer-events: auto;
`;

interface IInsertedData {
  name: string;
  label: string;
  icon: string;
  description: string;
}

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
  let insertedList: IInsertedData[] = [];
  if (prototype?.childrenName) {
    const names = Array.isArray(prototype?.childrenName)
      ? prototype.childrenName
      : [prototype.childrenName];
    insertedList = names.map((child) => {
      const proto = workspace.componentPrototypes.get(child);
      return {
        name: child,
        label: proto?.title || child,
        icon: proto?.icon,
        description: proto?.help,
      };
    });
  }

  let siblingList: IInsertedData[] = [];
  if (prototype?.siblingNames) {
    siblingList = prototype.siblingNames?.map((item) => {
      const proto = workspace.componentPrototypes.get(item);
      return {
        name: item,
        label: proto?.title || item,
        icon: proto?.icon,
        description: proto?.help,
      };
    });
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
      {siblingList.length > 0 ? (
        <>
          <InsertedDropdown
            title="在当前节点的前方添加兄弟节点"
            options={siblingList}
            onSelect={(name) => {
              workspace.insertBeforeSelectedNode(name);
            }}
          >
            <Tooltip title="在当前节点的前方添加兄弟节点">
              <SelectionHelper icon={<PlusOutlined />} css={topAddSiblingBtnStyle} />
            </Tooltip>
          </InsertedDropdown>
          <InsertedDropdown
            title="在当前节点的后方添加兄弟节点"
            options={siblingList}
            onSelect={(name) => {
              workspace.insertAfterSelectedNode(name);
            }}
          >
            <Tooltip title="在当前节点的后方添加兄弟节点">
              <SelectionHelper icon={<PlusOutlined />} css={bottomAddSiblingBtnStyle} />
            </Tooltip>
          </InsertedDropdown>
        </>
      ) : null}
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
                  label={data.codeId || data.name}
                  parents={data.parents}
                  onSelect={(item) => {
                    workspace.selectSource.select(item);
                  }}
                />
                {!isFromCurrentFile && (
                  <Tooltip title={`该节点来自其他文件（${data.filename}）`}>
                    <InfoCircleOutlined />
                  </Tooltip>
                )}
              </>
            }
          />
          <SelectionToolSet>{!isPage && actions}</SelectionToolSet>
          {insertedList.length > 0 && (
            <InsertedDropdown
              options={insertedList}
              onSelect={(name) => {
                workspace.insertToSelectedNode(name);
              }}
            >
              <Tooltip title="快捷添加子元素">
                <SelectionHelper icon={<PlusOutlined />} />
              </Tooltip>
            </InsertedDropdown>
          )}
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

  &:hover {
    background: var(--color-active-hover, var(--tango-colors-primary-50));
  }
`;

interface SelectionHelperProps extends HTMLCoralProps<'button'> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
}

const SelectionHelper = ({
  icon,
  label,
  children,
  css: customCss,
  ...rest
}: SelectionHelperProps) => {
  return (
    <Button
      position="relative"
      color="white"
      px="s"
      py="0"
      border="0"
      borderRadius="s"
      fontSize="12px"
      css={[selectionHelperStyle, customCss]}
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

interface InsertedDropdownProps extends DropdownProps {
  title?: string;
  options?: IInsertedData[];
  onSelect?: (name: string) => void;
}

function InsertedDropdown({
  title = '为当前节点添加子元素',
  options = [],
  onSelect,
  ...props
}: InsertedDropdownProps) {
  return (
    <Dropdown
      trigger={['click']}
      dropdownRender={() => {
        return (
          <Box
            bg="#FFF"
            borderRadius="m"
            boxShadow="lowDown"
            border="solid"
            borderColor="line2"
            overflow="hidden"
            width="320px"
          >
            <Box px="l" py="m" color="text2">
              {title}
            </Box>
            <Box maxHeight={360} overflowY="auto">
              {options.map((item) => (
                <InsertedItem
                  key={item.name}
                  label={item.label}
                  icon={item.icon}
                  description={item.description || '暂无组件描述'}
                  onClick={() => onSelect?.(item.name)}
                />
              ))}
            </Box>
          </Box>
        );
      }}
      {...props}
    />
  );
}

const insertedItemStyle = css`
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--tango-colors-fill2);
  }
`;

function InsertedItem({
  label,
  icon,
  description,
  ...rest
}: HTMLCoralProps<'div'> & Omit<IInsertedData, 'name'>) {
  let iconNode;
  if (!icon) {
    iconNode = <IconFont className="material-icon" type="icon-placeholder" />;
  } else if (icon.startsWith('icon-')) {
    iconNode = <IconFont className="material-icon" type={icon} />;
  } else {
    iconNode = <img src={icon} alt={label} />;
  }

  return (
    <Box
      display="flex"
      columnGap="m"
      px="l"
      py="m"
      fontSize="12px"
      css={insertedItemStyle}
      {...rest}
    >
      <Box
        size="35px"
        fontSize="32px"
        background="fill1"
        border="1px solid"
        borderColor="line2"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {iconNode}
      </Box>
      <Box>
        <Box fontWeight="500">{label}</Box>
        <Box color="text2">{description}</Box>
      </Box>
    </Box>
  );
}
