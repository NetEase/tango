import React, { useCallback, useMemo, useState } from 'react';
import {
  IVariableTreeNode,
  filterTreeData,
  isServiceVariablePath,
  isStoreVariablePath,
  noop,
  parseServiceVariablePath,
} from '@music163/tango-helpers';
import { css, Box, Text } from 'coral-system';
import { Button, Popconfirm, Tooltip, Tree } from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  FunctionOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { CopyClipboard, Panel, Search } from '@music163/tango-ui';
import { AddStoreForm, AddStoreVariableForm } from './add-store';
import { AddServiceForm } from './add-service';
import {
  NodeCommonDetail,
  ValueDefine,
  ValueDefineProps,
  ValueDetail,
  ValueDetailProps,
} from './value-detail';
import { ValuePreview } from './value-preview';
import { ServicePreview } from './service-preview';

const varTreeStyle = css`
  overflow: auto;
  position: relative;

  .ant-tree {
    font-family: Consolas, Menlo, Courier, monospace;
  }

  .ant-tree-node-content-wrapper.ant-tree-node-content-wrapper-normal {
    width: calc(100% - 50px);
  }

  .ant-tree .ant-tree-treenode {
    padding: 0;
  }
  .ant-tree.ant-tree-directory .ant-tree-treenode::before {
    bottom: 0;
  }

  .ant-tree-indent-unit {
    width: 12px;
  }
`;

type SelectNodeCallback = (data: IVariableTreeNode) => void;

type DetailModeType =
  | 'detail'
  | 'storeVariableDetail'
  | 'serviceDetail'
  | 'addVariable'
  | 'addStore'
  | 'addService';

interface IVariableTreeRenderDetailState {
  mode: DetailModeType;
  setMode: (mode: DetailModeType) => void;
  activeNode: IVariableTreeNode;
  clear: () => void;
}

export interface VariableTreeProps {
  defaultValueDetailMode?: ValueDetailProps['defaultMode'];
  dataSource: IVariableTreeNode[];
  appContext?: object;
  serviceModules?: any[];
  getPreviewValue?: (node: IVariableTreeNode) => unknown;
  getServiceData?: (serviceKey: string) => object;
  getServiceNames?: (moduleName: string) => string[];
  getStoreNames?: () => string[];
  onSelect?: SelectNodeCallback;
  onAddStoreVariable?: (storeName: string, data: any) => void;
  onUpdateStoreVariable?: ValueDefineProps['onSave'];
  onRemoveStoreVariable?: (variableKey: string) => void;
  onAddStore?: (newStoreName: string) => void;
  onAddService?: (data: object) => void;
  onUpdateService?: (data: object) => void;
  onRemoveService?: (variableKey: string) => void;
  onCopy?: (data: IVariableTreeNode) => void;
  onView?: SelectNodeCallback;
  height?: number | string;
  showViewButton?: boolean;
  /**
   * 自定义头部
   */
  renderHeaderExtra?: (
    props: VariableTreeProps,
    state: IVariableTreeRenderDetailState,
  ) => React.ReactNode;
  /**
   * 自定义变量详情渲染
   * @param props
   * @param state
   * @returns
   */
  renderDetail?: (
    props: VariableTreeProps,
    state: IVariableTreeRenderDetailState,
  ) => React.ReactNode;
}

export function VariableTree(props: VariableTreeProps) {
  const {
    dataSource = [],
    serviceModules = [],
    appContext = {},
    defaultValueDetailMode,
    onSelect = noop,
    onAddStoreVariable = noop,
    onAddStore = noop,
    onAddService = noop,
    onUpdateStoreVariable = noop,
    onUpdateService = noop,
    onRemoveStoreVariable,
    onRemoveService,
    onCopy = noop,
    onView = noop,
    getServiceData,
    getServiceNames,
    getStoreNames,
    getPreviewValue = noop,
    showViewButton,
    renderHeaderExtra,
    renderDetail: renderDetailProp,
    ...rest
  } = props;
  const [keyword, setKeyword] = useState('');
  const [activeNode, setActiveNode] = useState<IVariableTreeNode>();
  const [mode, setMode] = useState<DetailModeType>();
  const clear = useCallback(() => {
    setActiveNode(null);
    setMode(null);
  }, []);

  const selectNode = useCallback((node: IVariableTreeNode, callback?: SelectNodeCallback) => {
    if (isStoreVariablePath(node.key)) {
      setMode('storeVariableDetail');
    } else if (isServiceVariablePath(node.key)) {
      setMode('serviceDetail');
    } else {
      setMode('detail');
    }
    setActiveNode(node);
    callback?.(node);
  }, []);

  const treeData = useMemo(() => {
    const pattern = new RegExp(keyword, 'ig');
    return keyword
      ? filterTreeData(dataSource, (leaf) => pattern.test(leaf.title), 'children', true)
      : dataSource;
  }, [keyword, dataSource]);

  const state = { activeNode, mode, setMode, clear };

  return (
    <Box display="flex" columnGap="l" className="VariableTree" css={varTreeStyle} {...rest}>
      <Box className="VariableList" width="40%">
        {renderHeaderExtra?.(props, state)}
        <Box mb="m" position="sticky" top="0" bg="white" zIndex={2}>
          <Search placeholder="请输入变量名" onChange={(val) => setKeyword(val?.trim())} />
        </Box>
        <Tree
          blockNode
          showIcon={false}
          defaultExpandAll
          treeData={treeData}
          onSelect={(keys, detail) => {
            selectNode(detail.node, onSelect);
          }}
          titleRender={(node) => {
            const isLeaf = !node.children;

            if (isLeaf) {
              const showView = node.showViewButton ?? showViewButton;

              let nodePath = node.key;
              if (/^(stores|services)\./.test(nodePath)) {
                nodePath = `tango.${node.key.replaceAll('.', '?.').replace('?.', '.')}`;
              }

              return (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Text flex="1" truncated>
                    {node.title}
                    {node.type === 'function' && (
                      <Text color="text3" ml="m">
                        <FunctionOutlined />
                      </Text>
                    )}
                  </Text>
                  <Box flex="0 0 72px" textAlign="right">
                    {node.showRemoveButton && (
                      <Popconfirm
                        title={`确认删除吗 ${node.title}？该操作会导致引用此模型的代码报错，请谨慎操作！`}
                        onConfirm={(e) => {
                          e.stopPropagation();
                          if (isStoreVariablePath(node.key)) {
                            onRemoveStoreVariable(node.key);
                          } else {
                            onRemoveService(node.key);
                          }
                        }}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </Popconfirm>
                    )}
                    <CopyClipboard text={nodePath}>
                      {({ copied, onClick }) => {
                        const label = copied ? '已复制' : '复制变量路径';
                        return (
                          <Tooltip title={label}>
                            <Button
                              type="text"
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                                onCopy(node);
                              }}
                            />
                          </Tooltip>
                        );
                      }}
                    </CopyClipboard>
                    {showView && (
                      <Tooltip title="查看变量详情">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectNode(node, onView);
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            }

            return (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text mr="m">{node.title}</Text>
                <Box>
                  {/^\$?stores$/.test(node.key) && (
                    <Tooltip title="新建数据模型">
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode('addStore');
                        }}
                      />
                    </Tooltip>
                  )}
                  {node.showAddButton && /^stores\.[a-zA-Z0-9]+$/.test(node.key) && (
                    <Tooltip title={`向 ${node.title} 中添加变量`}>
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNode(node);
                          setMode('addVariable');
                        }}
                      />
                    </Tooltip>
                  )}
                  {/^services(\.[a-zA-Z0-9]+)?$/.test(node.key) && (
                    <Tooltip title={`向 ${node.title} 中添加服务函数`}>
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNode(node);
                          setMode('addService');
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </Box>
            );
          }}
        />
      </Box>
      <Box className="VariableDetail" flex="1" position="sticky" top="0" overflow="auto">
        {(function renderDetail() {
          const customRenderer = renderDetailProp?.(props, state);
          if (customRenderer) {
            return customRenderer;
          }

          if (mode === 'detail') {
            return <NodeCommonDetail data={activeNode} />;
          }
          if (mode === 'storeVariableDetail') {
            return (
              <ValueDetail key={activeNode.key} defaultMode={defaultValueDetailMode}>
                {(previewMode) =>
                  previewMode === 'runtime' ? (
                    <ValuePreview
                      value={getPreviewValue(activeNode)}
                      onCopy={(valuePath) => {
                        return ['tango', activeNode.key.replaceAll('.', '?.'), valuePath].join('.');
                      }}
                    />
                  ) : (
                    <ValueDefine data={activeNode} onSave={onUpdateStoreVariable} />
                  )
                }
              </ValueDetail>
            );
          }
          if (mode === 'serviceDetail') {
            return (
              <>
                <Panel shape="solid" title="服务函数配置">
                  <AddServiceForm
                    key={activeNode.key}
                    serviceModules={serviceModules}
                    serviceNames={(function () {
                      const { moduleName } = parseServiceVariablePath(activeNode.key);
                      return getServiceNames?.(moduleName) || [];
                    })()}
                    initialValues={{
                      ...getServiceData?.(activeNode.key),
                    }}
                    onCancel={clear}
                    onSubmit={(values) => {
                      onUpdateService(values);
                    }}
                  />
                </Panel>
                <Panel shape="solid" title="服务函数预览" mt="l">
                  <ServicePreview
                    key={activeNode.key}
                    appContext={appContext}
                    functionKey={activeNode.key}
                  />
                </Panel>
              </>
            );
          }
          if (mode === 'addVariable') {
            return (
              <AddStoreVariableForm
                parentNode={activeNode}
                onSubmit={(storeName, data) => {
                  onAddStoreVariable(storeName, data);
                  clear();
                }}
                onCancel={() => {
                  clear();
                }}
              />
            );
          }
          if (mode === 'addStore') {
            return (
              <AddStoreForm
                storeNames={getStoreNames?.() || []}
                onSubmit={({ name }) => {
                  onAddStore(name);
                  clear();
                }}
                onCancel={() => {
                  clear();
                }}
              />
            );
          }
          if (mode === 'addService') {
            return (
              <Panel shape="solid" title="创建服务函数">
                <AddServiceForm
                  key={activeNode.key}
                  serviceModules={serviceModules}
                  serviceNames={activeNode.children?.map((item) => item.title) || []}
                  initialValues={{
                    moduleName: activeNode.title,
                  }}
                  onCancel={() => {
                    clear();
                  }}
                  onSubmit={(values) => {
                    onAddService(values);
                    clear();
                  }}
                />
              </Panel>
            );
          }
        })()}
      </Box>
    </Box>
  );
}
