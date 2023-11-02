import React, { useMemo } from 'react';
import cx from 'classnames';
import { Box, Text, css, HTMLCoralProps } from 'coral-system';
import { Badge } from 'antd';
import { ReactComponentProps } from '@music163/tango-helpers';
import { observer, useDesigner } from '@music163/tango-context';
import { ResizableBox } from './resizable-box';
import { getWidget } from '../widgets';

const sidebarStyle = css`
  position: relative;
  background-color: var(--tango-colors-custom-sidebarBg);
  border-right: 1px solid var(--tango-colors-line-normal);
  box-shadow: rgb(0 0 0 / 5%) 0px 0px 18px;
  height: 100%;

  .SidebarPanelBarList {
    width: 50px;
    list-style: none;
    user-select: none;
    transition: all 0.3s ease;
  }

  .SidebarPanelBarListItem {
    &.active {
      background-color: var(--tango-colors-custom-sidebarItemActiveBg);
    }

    &:hover {
      background-color: var(--tango-colors-custom-sidebarItemHoverBg);
    }
  }
`;

export interface SidebarProps extends ReactComponentProps {
  /**
   * 面板宽度
   */
  panelWidth?: number;
  /**
   * 底部附加内容
   */
  footer?: React.ReactNode;
}

export interface SidebarPanelItemProps
  extends Omit<SidebarPanelBarItemProps, 'isActive'>,
    HTMLCoralProps<'div'> {
  /**
   * 面板唯一标识符
   */
  key?: string;
  /**
   * 面板标题
   * @deprecated
   */
  title?: string;
  /**
   * 文档地址
   * @deprecated
   */
  doc?: string;
  /**
   * 是否为浮动面板
   */
  isFloat?: boolean;
  /**
   * 面板宽度
   */
  width?: number;
  /**
   * 如果 key 匹配到内置组件的话，传递给子节点的属性
   */
  widgetProps?: object;
}

function BaseSidebarPanel({ panelWidth: defaultPanelWidth = 280, footer, children }: SidebarProps) {
  const items = useMemo(() => {
    const ret: Record<string, SidebarPanelItemProps> = {};
    React.Children.forEach(children, (child) => {
      if (child && React.isValidElement(child)) {
        const widget = getWidget(['sidebar', child.key].join('.'));
        const fallbackNode = widget ? React.createElement(widget, child.props.widgetProps) : null;
        ret[child.key] = {
          children: fallbackNode,
          ...child.props,
        };
      }
    });
    return ret;
  }, [children]);

  const designer = useDesigner();
  const panel = items[designer.activeSidebarPanel];
  const floatPanelStyle: any = panel?.isFloat
    ? {
        position: 'absolute',
        left: '50px',
        top: 0,
        zIndex: 1000,
        height: '100%',
        boxShadow: 'var(--tango-shadows-lowRight)',
      }
    : {};
  const panelWidth = typeof panel?.width === 'number' ? panel?.width : defaultPanelWidth;

  return (
    <Box display="flex" flexShrink={0} css={sidebarStyle} className="SidebarPanel">
      <Box className="SidebarPanelBar" display="flex" flexDirection="column" position="relative">
        <Box as="ul" flex="0" p="0" m="0" textAlign="center" className="SidebarPanelBarList">
          {Object.keys(items).map((key) => {
            const item = items[key];
            const isActive = key === designer.activeSidebarPanel;
            return (
              <li
                className={cx('SidebarPanelBarListItem', { active: isActive })}
                key={key}
                title={item.title}
                onClick={() => {
                  designer.setActiveSidebarPanel(key);
                }}
              >
                <SidebarPanelBarItem
                  icon={item.icon}
                  label={item.label}
                  showBadge={item.showBadge}
                  isActive={isActive}
                />
              </li>
            );
          })}
        </Box>
        <Box
          className="SidebarPanelBarFooter"
          pb="l"
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-end"
        >
          {footer}
        </Box>
      </Box>
      {panel ? (
        <ResizableBox key={panel.label} width={panelWidth} style={floatPanelStyle}>
          <SidebarPanelExpandedContent
            isFloat={panel.isFloat}
            closeable={panel.isFloat}
            onClose={() => {
              designer.closeSidebarPanel();
            }}
          >
            {panel.children}
          </SidebarPanelExpandedContent>
        </ResizableBox>
      ) : null}
    </Box>
  );
}

BaseSidebarPanel.Item = function ({
  key,
  title,
  doc,
  isFloat,
  width,
  widgetProps,
}: SidebarPanelItemProps) {
  return <></>;
};

export const Sidebar = observer(BaseSidebarPanel);

interface SidebarPanelBarItemProps {
  /**
   * 是否选中
   */
  isActive?: boolean;
  /**
   * 侧边栏图标
   */
  icon?: React.ReactNode;
  /**
   * 侧边栏图标说明，推荐使用 2 个字
   */
  label?: string;
  /**
   * 是否展示徽标
   */
  showBadge?:
    | false
    | {
        /**
         * 是否显示小圆点
         */
        dot?: boolean;
        /**
         * 展示的数字
         */
        count?: number;
      };
}

function SidebarPanelBarItem({
  isActive,
  icon: iconProp,
  label,
  showBadge,
}: SidebarPanelBarItemProps) {
  const color = isActive ? 'brand' : 'text.body';
  let icon = (
    <Text fontSize="24px" lineHeight={1} color={color}>
      {iconProp}
    </Text>
  );
  if (showBadge) {
    icon = (
      <Badge size="small" {...showBadge}>
        {icon}
      </Badge>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py="12px"
    >
      {icon}
      <Text fontSize="12px" mt="s" color={color}>
        {label}
      </Text>
    </Box>
  );
}

const expandPanelStyle = css`
  flex: 1;
  height: 100%;
  background-color: var(--tango-colors-white);
  border-left: 1px solid var(--tango-colors-line-normal);
  position: relative;
  overflow-y: auto;

  &.isFloat {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1000;
    height: 100%;
    width: 100%;
    box-shadow: var(--tango-shadows-lowRight);
  }
`;

function SidebarPanelExpandedContent({
  closeable,
  onClose,
  isFloat,
  className,
  children,
  ...rest
}: Omit<SidebarPanelItemProps, 'label' | 'icon' | 'title' | 'doc'> & {
  closeable?: boolean;
  onClose: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const classNames = cx(
    'SidebarPanelExpanded',
    {
      isFloat,
    },
    className,
  );
  return (
    <Box css={expandPanelStyle} className={classNames} {...rest}>
      {children}
    </Box>
  );
}
