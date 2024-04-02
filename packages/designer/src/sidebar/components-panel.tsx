import React, { useMemo, useState } from 'react';
import { Box, Grid, Text } from 'coral-system';
import styled from 'styled-components';
import {
  IComponentPrototype,
  logger,
  PartialRecord,
  upperCamelCase,
} from '@music163/tango-helpers';
import { CollapsePanel, IconFont, Search, Tabs } from '@music163/tango-ui';
import { observer, useWorkspace } from '@music163/tango-context';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Spin, Popover } from 'antd';
import { getDragGhostElement } from '../helpers';

type MenuKeyType = 'common' | 'atom' | 'snippet' | 'bizComp' | 'localComp';
type MenuValueType = Array<{ title: string; items: string[] }>;
export type MenuDataType = PartialRecord<MenuKeyType, MenuValueType>;

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
    menuData = emptyMenuData,
    showBizComps = true,
    getBizCompName = upperCamelCase,
    loading = false,
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
        <Tabs centered isTabBarSticky tabBarStickyOffset={48} items={tabs} />
      );

    return (
      <Box className="ComponentsView" overflowY="auto">
        <Box px="l" py="m" position="sticky" top="0" zIndex={1} bg="white">
          <Search placeholder="搜索物料" onChange={setKeyword} />
        </Box>
        <Spin spinning={loading} tip="正在加载物料列表...">
          {!keyword ? contentNode : <MaterialList data={allList} filterKeyword={keyword} />}
        </Spin>
      </Box>
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
            >
              {!items.length && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配到任何组件" />
              )}
              <Grid
                columns={type === 'localComp' ? 1 : 2}
                spacing="1px"
                bg="background.normal"
                padding="0"
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
  justify-content: center;
  padding: 8px;
  cursor: move;
  text-align: center;
  color: var(--tango-colors-text-body);
  background-color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .material-icon {
    font-size: 40px;
  }

  .info {
    position: absolute;
    right: 4px;
    top: 4px;
    cursor: pointer;
  }

  .anticon-question-circle {
    display: none;
    position: absolute;
    top: 8px;
    right: 8px;
  }

  img {
    height: 40px;
    width: 40px;
  }

  &:hover {
    box-shadow: 0 0 10px rgb(0 0 0 / 10%);

    > span {
      color: var(--tango-colors-brand);
    }

    .anticon-question-circle {
      display: inline-block;
    }
  }
`;

function MaterialGrid({ data }: MaterialProps) {
  const workspace = useWorkspace();

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

  const icon = data.icon || 'icon-placeholder';

  return (
    <StyledCommonGridItem
      draggable
      data-name={data.name}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {icon.startsWith('icon-') ? (
        <IconFont className="material-icon" type={data.icon || 'icon-placeholder'} />
      ) : (
        <img src={icon} alt={data.name} />
      )}
      <Text fontSize="12px" lineHeight="1.5">
        {data.title}
      </Text>
      <Text fontSize="12px" color="gray.50">
        {data.name}
      </Text>
      {data.docs || data.help ? (
        <Popover placement="right" title={data.title} content={<CommonMaterialInfoBox {...data} />}>
          <QuestionCircleOutlined />
        </Popover>
      ) : null}
    </StyledCommonGridItem>
  );
}

function CommonMaterialInfoBox({ help, docs }: IComponentPrototype) {
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
