import React, { useMemo, useState } from 'react';
import { Box, Grid, Text } from 'coral-system';
import styled, { css } from 'styled-components';
import {
  IComponentPrototype,
  MenuDataType,
  MenuValueType,
  createContext,
  logger,
  upperCamelCase,
} from '@music163/tango-helpers';
import { CollapsePanel, IconFont, Search, Tabs } from '@music163/tango-ui';
import { observer, useWorkspace } from '@music163/tango-context';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Spin, Popover, TabsProps } from 'antd';
import { getDragGhostElement } from '../helpers';

type IComponentsPanelContext = {
  isScope: boolean;
  onItemSelect: (name: string) => void;
  layout: 'grid' | 'line';
};

const [ComponentsPanelProvider, usePanelContext] = createContext<IComponentsPanelContext>({
  name: 'ComponentsPanelContext',
});

export interface ComponentsPanelProps {
  /**
   * 菜单数据
   */
  menuData: MenuDataType;
  /**
   * 展示业务组件分类
   */
  showBizComps?: boolean;
  /**
   * 动态加载物料 loading，避免未加载完成用户点击空列表
   */
  loading?: boolean;
  /**
   * 设置业务组件调用名
   * @param name
   * @returns
   */
  getBizCompName?: (name: string) => string;
  /**
   * 是否局部模式 (快捷添加组件面板中使用)
   */
  isScope?: boolean;
  /**
   * 组件选中回调
   */
  onItemSelect?: (name: string) => void;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * tabProps
   */
  tabProps?: TabsProps;
  /**
   * 布局模式，默认网格布局
   */
  layout?: 'grid' | 'line';
}

const localeMap = {
  common: '基础组件',
  atom: '原子组件',
  snippet: '组合',
  bizComp: '业务组件',
  localComp: '本地组件',
};

const emptyMenuData: MenuDataType = {
  common: [],
};

export function useFlatMenuData<T>(menuData: T) {
  const flatList = useMemo(() => {
    const set = new Set<string>();
    Object.values(menuData).forEach((cates) => {
      cates.forEach((cate: any) => {
        cate.items?.forEach((item: any) => {
          set.add(item);
        });
      });
    });
    return Array.from(set);
  }, [menuData]);
  return [
    {
      title: '搜索结果',
      items: flatList,
    },
  ];
}

export const ComponentsPanel = observer(
  ({
    isScope = false,
    menuData = emptyMenuData,
    showBizComps = true,
    getBizCompName = upperCamelCase,
    loading = false,
    style,
    tabProps,
    onItemSelect,
    layout = 'grid',
  }: ComponentsPanelProps) => {
    const [keyword, setKeyword] = useState<string>('');
    const allList = useFlatMenuData<MenuDataType>(menuData);
    const workspace = useWorkspace();
    const [bizCompData, localCompData] = useMemo(
      () => [
        [{ title: '已安装业务组件', items: workspace.bizComps.map(getBizCompName) }],
        [{ title: '本地组件', items: workspace.localComps }],
      ],
      [workspace.bizComps, workspace.localComps, getBizCompName],
    );

    const tabs = Object.keys(menuData).map((key) => ({
      key,
      label: localeMap[key],
      children: <MaterialList data={menuData[key]} />,
    }));

    if (showBizComps) {
      tabs.push({
        key: 'bizComp',
        label: localeMap.bizComp,
        children: <MaterialList type="bizComp" data={bizCompData} />,
      });
    }

    if (localCompData.length) {
      tabs.push({
        key: 'localComps',
        label: localeMap.localComp,
        children: <MaterialList data={localCompData} />,
      });
    }

    const contentNode =
      tabs.length === 1 ? (
        tabs[0].children
      ) : (
        <Tabs
          size={isScope ? 'small' : 'middle'}
          centered
          isTabBarSticky
          tabBarStickyOffset={48}
          items={tabs}
          {...tabProps}
        />
      );

    return (
      <ComponentsPanelProvider
        value={{
          isScope,
          onItemSelect,
          layout,
        }}
      >
        <Box className="ComponentsView" overflowY="auto" style={style}>
          <Box px="l" py="m" position="sticky" top="0" zIndex={3} bg="white">
            <Search
              style={{
                borderRadius: '4px',
              }}
              placeholder="搜索物料"
              onChange={setKeyword}
            />
          </Box>
          <Spin spinning={loading} tip="正在加载物料列表...">
            {!keyword ? contentNode : <MaterialList data={allList} filterKeyword={keyword} />}
          </Spin>
        </Box>
      </ComponentsPanelProvider>
    );
  },
);

interface MaterialListProps {
  /**
   * 数据集
   */
  data: MenuValueType;
  /**
   * 过滤的关键词
   */
  filterKeyword?: string;
  /**
   * 物料类型
   */
  type?: 'common' | 'bizComp' | 'localComp';
}

function MaterialList({ data, filterKeyword, type = 'common' }: MaterialListProps) {
  const workspace = useWorkspace();
  const { layout } = usePanelContext();
  const isGrid = layout === 'grid';

  return (
    <Box className="ComponentsViewList">
      {data.map((cate) => {
        let items = cate.items || [];
        if (filterKeyword) {
          items = items.filter((item) => {
            const pattern = new RegExp(filterKeyword, 'ig');
            const prototype = workspace.componentPrototypes.get(item);
            return prototype && (pattern.test(prototype.name) || pattern.test(prototype.title));
          });
        }

        const addBlock = items.length % 2 === 1;
        return (
          <Box key={cate.title}>
            <CollapsePanel
              key={cate.title}
              title={cate.title}
              borderBottom="solid"
              borderColor="line.normal"
              showBottomBorder={false}
              bodyProps={{
                padding: isGrid ? '4px 12px 12px' : '0',
              }}
            >
              {!items.length && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配到任何组件" />
              )}
              <Grid
                templateColumns={isGrid ? 'repeat(auto-fit,minmax(55px,1fr))' : '1fr'}
                spacing="1px"
                bg="background.normal"
                padding="0"
                gap={isGrid ? '12px 8px' : '0'}
                backgroundColor="white"
              >
                {items.map((item) => {
                  const prototype = workspace.componentPrototypes.get(item);
                  if (!prototype) {
                    logger.log(`<${item}> prototype not found!`);
                  }
                  return prototype ? <MaterialGrid key={item} data={prototype} /> : null;
                })}
                {addBlock && <Box bg="white" />}
              </Grid>
            </CollapsePanel>
          </Box>
        );
      })}
    </Box>
  );
}

interface MaterialProps {
  data: IComponentPrototype;
}

const StyledCommonGridItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  cursor: ${(props) => (props.draggable ? 'grab' : 'pointer')};
  text-align: center;
  color: var(--tango-colors-text-body);
  background-color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .material-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    background: #f9f9f9;
    border-radius: 4px;
    border: 1px solid #ebebeb;
    width: 100%;
    height: 52px;
    position: relative;
    transition: 0.15s ease-in-out;
    transition-property: transform;
    will-change: transform;
  }

  .info {
    position: absolute;
    right: 4px;
    top: 4px;
    cursor: pointer;
  }

  .anticon-question-circle {
    display: none;
    font-size: 13px;
    position: absolute;
    top: 4px;
    right: 4px;
  }

  &:hover {
    > span {
      color: var(--tango-colors-brand);
    }

    .anticon-question-circle {
      display: inline-block;
    }
    .material-icon {
      border-color: #c7c7c7;
    }
  }
`;

const GridLineItemStyle = css`
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--tango-colors-fill2);
  }
`;

function MaterialGrid({ data }: MaterialProps) {
  const workspace = useWorkspace();
  const { isScope, onItemSelect, layout } = usePanelContext();

  const isLine = layout === 'line';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';

    workspace.dragSource.set({
      name: data.name,
    });

    const ghost = getDragGhostElement();
    e.dataTransfer.setDragImage(ghost, 0, 0);
  };

  const handleDragEnd = () => {
    workspace.dragSource.clear();
  };

  const handleSelect = () => {
    onItemSelect?.(data.name);
  };

  const icon = data.icon || 'icon-placeholder';
  if (isLine) {
    return (
      <Box
        key={data.name}
        display="flex"
        columnGap="m"
        px="l"
        py="m"
        fontSize="12px"
        css={GridLineItemStyle}
        onClick={handleSelect}
      >
        <Box
          p="m"
          fontSize="32px"
          width="46px"
          height="46px"
          background="fill1"
          border="1px solid"
          borderRadius="4px"
          borderColor="line2"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {icon.startsWith('icon-') ? (
            <IconFont className="material-icon" type={data.icon || 'icon-placeholder'} />
          ) : (
            <img className="material-icon" src={icon} alt={data.name} />
          )}
        </Box>
        <Box flex={1}>
          <Box fontWeight="500" display="flex" justifyContent="space-between">
            <Text flex={1}>{data.title}</Text>
            {data.docs ? (
              <Popover
                zIndex={9999}
                placement="right"
                title={data.title}
                content={<CommonMaterialInfoBox docs={data.docs} />}
              >
                <QuestionCircleOutlined />
              </Popover>
            ) : null}
          </Box>
          <Box color="text2" fontStyle="italic">
            {data.help ?? data.title}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <StyledCommonGridItem
      key={data.name}
      draggable={!isScope}
      data-name={data.name}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleSelect}
    >
      {icon.startsWith('icon-') ? (
        <IconFont className="material-icon" type={data.icon || 'icon-placeholder'} />
      ) : (
        <img className="material-icon" src={icon} alt={data.name} />
      )}
      <Text fontSize="12px" marginTop="4px">
        {data.title ?? data.name}
      </Text>
      <Text fontSize="10px" color="gray.50">
        {data.name}
      </Text>
      {data.docs || data.help ? (
        <Popover
          zIndex={9999}
          placement="right"
          title={data.title}
          content={<CommonMaterialInfoBox {...data} />}
        >
          <QuestionCircleOutlined />
        </Popover>
      ) : null}
    </StyledCommonGridItem>
  );
}

function CommonMaterialInfoBox({ help, docs }: Pick<IComponentPrototype, 'help' | 'docs'>) {
  return (
    <Box maxWidth={300}>
      {!!help && <Box mb="m">{help}</Box>}
      {!!docs && (
        <Button size="small" block target="_blank" href={docs}>
          查看组件文档
        </Button>
      )}
    </Box>
  );
}
