import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, css } from 'coral-system';
import { Empty } from 'antd';
import {
  IComponentPrototype,
  IComponentProp,
  noop,
  filterTreeData,
  mapTreeData,
} from '@music163/tango-helpers';
import { Action, Search, Tabs } from '@music163/tango-ui';
import { SettingFormItem, register } from './form-item';
import { FormModelProvider, FormVariableProvider } from './context';
import { FormModel, FormModelOptionsType } from './form-model';
import { SettingFormObject } from './form-object';
import { isValidNestProps } from './helpers';
import { registerBuiltinSetters } from './setter';
import { FormHeader } from './form-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';

registerBuiltinSetters();

function normalizeComponentProps(
  props: IComponentPrototype['props'],
  groupOptions: IFormTabsGroupOption[],
) {
  const groups: Record<string, IComponentProp[]> = groupOptions.reduce((prev, cur) => {
    prev[cur.value] = [];
    return prev;
  }, {});

  props.forEach((prop) => {
    const group = groups[prop.group] ? prop.group : 'basic';
    groups[group].push(prop);
  });

  return groups;
}

function filterComponentProps(props: IComponentPrototype['props'], keyword: string) {
  if (!keyword) {
    return props;
  }
  const pattern = new RegExp(keyword, 'ig');
  return filterTreeData(
    props,
    (prop) => pattern.test(prop.title) || pattern.test(prop.name),
    'props',
  );
}

const formStyle = css`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  > .SettingFormMain > :first-child:is(.FormControl) {
    margin-top: var(--tango-space-m);
  }

  > .SettingFormMain > .FormControl {
    margin-left: var(--tango-space-m);
    margin-right: var(--tango-space-m);
  }

  > .SettingFormMain > .FormObject {
    margin-left: var(--tango-space-m);
    margin-right: var(--tango-space-m);
  }
`;

interface IFormTabsGroupOption {
  label: string;
  value: string;
}

const internalGroups: IFormTabsGroupOption[] = [
  { label: '基本', value: 'basic' },
  // { label: '事件', value: 'event' },
  { label: '样式', value: 'style' },
  { label: '高级', value: 'advanced' },
];

export interface SettingFormProps {
  /**
   * 表单状态管理模型实例
   */
  model?: FormModel;
  /**
   * 默认状态初值，如果没有传 model，则会基于 defaultValue 在表单内进行 model 实例化
   */
  defaultValue?: unknown;
  /**
   * 表单值变化时的回调，在校验执行后触发，仅在使用内置 model 时有效
   */
  onChange?: FormModelOptionsType['onChange'];
  /**
   * 组件的可配置描述
   */
  prototype?: IComponentPrototype;
  /**
   * 是否显示组件标识
   */
  showIdentifier?:
    | false
    | {
        identifierKey: string;
      };
  /**
   * 是否显示搜索框
   */
  showSearch?: boolean;
  /**
   * 是否显示分组导航
   */
  showGroups?: boolean;
  /**
   * 选项分组信息，用于对表单项进行分组展示，如未提供，则使用内置的分组信息
   */
  groupOptions?: IFormTabsGroupOption[];
  /**
   * 是否显示表单项的副标题
   */
  showItemSubtitle?: boolean;
  /**
   * 自定义渲染表单项的额外内容（标签右侧）
   */
  renderItemExtra?: (props: IComponentProp) => React.ReactNode;
  /**
   * 是否允许表单项切换到表达式设置器
   */
  disableSwitchExpressionSetter?: boolean;
}

export function SettingForm({
  prototype,
  disableSwitchExpressionSetter,
  model: modelProp,
  defaultValue,
  onChange = noop,
  showIdentifier = false,
  showSearch = true,
  showGroups = true,
  showItemSubtitle = true,
  renderItemExtra,
  groupOptions = internalGroups,
}: SettingFormProps) {
  const [keyword, setKeyword] = useState('');
  const [tabKey, setTabKey] = useState<string>('basic');
  const [model, setModel] = useState(modelProp ?? new FormModel(defaultValue, { onChange }));
  const { props: componentProps = [] } = prototype;
  const componentPropGroups = useMemo(() => {
    return normalizeComponentProps(componentProps, groupOptions);
  }, [componentProps, groupOptions]);

  const filterProps = useMemo(() => {
    const computedProps = mapTreeData(componentProps, (node) => {
      const { getProp, ...rest } = node;
      return {
        ...rest,
        ...getProp?.(model),
      };
    });

    // 没有进行搜索的情况
    if (!keyword) {
      if (showGroups) {
        return componentPropGroups[tabKey] || [];
      } else {
        return computedProps;
      }
    }

    // 用户进行搜索的情况
    return filterComponentProps(computedProps, keyword);
  }, [keyword, componentProps, tabKey, model, showGroups, componentPropGroups]);

  const renderProps = useCallback(
    (list: IComponentProp[]) =>
      list.map((item) => {
        const { getProp, ...rest } = item;
        const childProp = {
          ...rest,
          ...getProp?.(model),
        };
        if (isValidNestProps(childProp.props)) {
          return <SettingFormObject key={item.name} {...childProp} />;
        } else {
          return (
            <SettingFormItem key={item.name} extra={renderItemExtra?.(childProp)} {...childProp} />
          );
        }
      }),
    [model, renderItemExtra],
  );

  useEffect(() => {
    // 当外部传入的 model 变化时，同步新的 model
    if (modelProp && modelProp !== model) {
      setModel(modelProp);
    }
  }, [modelProp]);

  return (
    <FormVariableProvider value={{ disableSwitchExpressionSetter, showItemSubtitle }}>
      <FormModelProvider value={model}>
        <Box className="SettingForm" mb="xl" css={formStyle}>
          <Box className="SettingFormHeader" bg="white">
            <Box px="l" py="m">
              {showIdentifier && (
                <FormHeader
                  title={prototype.title}
                  subTitle={
                    <SettingFormItem
                      noStyle
                      setter="idSetter"
                      name={showIdentifier.identifierKey}
                    />
                  }
                  extra={
                    prototype?.docs ? (
                      <Action
                        icon={<QuestionCircleOutlined />}
                        tooltip="查看组件文档"
                        href={prototype.docs}
                      />
                    ) : null
                  }
                />
              )}
              {showSearch && (
                <Box className="SettingFormSearch" mt="m">
                  <Search
                    placeholder="搜索属性"
                    onChange={(val) => {
                      setKeyword(val?.trim());
                    }}
                  />
                </Box>
              )}
            </Box>
            {!keyword && showGroups && (
              <Box className="SettingFormNav">
                <Tabs activeKey={tabKey} onChange={setTabKey}>
                  {groupOptions.map((group) => (
                    <Tabs.TabPane
                      key={group.value}
                      tab={group.label}
                      disabled={!componentPropGroups[group.value].length}
                    />
                  ))}
                </Tabs>
              </Box>
            )}
          </Box>
          <Box
            className="SettingFormMain"
            display="flex"
            flexDirection="column"
            paddingBottom="m"
            rowGap="m"
            overflow="auto"
          >
            {renderProps(filterProps)}
            {filterProps.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到配置项" />
            )}
          </Box>
        </Box>
      </FormModelProvider>
    </FormVariableProvider>
  );
}

SettingForm.register = register;
