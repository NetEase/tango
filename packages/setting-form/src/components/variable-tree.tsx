import React, { useMemo, useState } from 'react';
import {
  Tree,
  Button,
  Form,
  Input,
  Space,
  ModalProps,
  Modal,
  Radio,
  Empty,
  Popconfirm,
  Tooltip,
  Alert,
} from 'antd';
import { Box, Text, css, Link } from 'coral-system';
import { PlusOutlined, FunctionOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  filterTreeData,
  isFunction,
  isNil,
  isString,
  noop,
  useBoolean,
} from '@music163/tango-helpers';
import {
  Panel,
  InputCode,
  Search,
  JsonView,
  JsonViewProps,
  CopyClipboard,
} from '@music163/tango-ui';
import { isValidExpressionCode } from '@music163/tango-core';

export type VariableTreeNodeType = {
  /**
   * 唯一标识符
   */
  key: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 是否可选中
   */
  selectable?: boolean;
  /**
   * 展示添加子节点的图标
   */
  showAddChildIcon?: boolean;
  /**
   * 展示删除删除图标
   */
  showDeleteIcon?: boolean;
  /**
   * 结点类型，用来展示图标
   */
  type?: 'function' | 'property';
  /**
   * 定义的原始值
   */
  raw?: any;
  /**
   * 子结点
   */
  children?: VariableTreeNodeType[];
  [key: string]: any;
};

type VariableModelType = 'preview' | 'define' | 'add';

export interface EditableVariableTreeProps {
  /**
   * 允许的变量面板
   */
  modes?: VariableModelType[];
  /**
   * 默认的变量面板
   */
  defaultMode?: VariableModelType;
  /**
   * 数据源
   */
  dataSource?: VariableTreeProps['dataSource'];
  /**
   * 点击添加变量的回调
   */
  onAddVariable?: AddNodeFormProps['onSubmit'];
  /**
   * 预览值取值函数
   */
  getPreviewValue?: (node: VariableTreeNodeType) => unknown;
  /**
   * 选择列表项时的回调
   */
  onSelect?: (data: VariableTreeNodeType) => void;
  /**
   * 点击使用此变量按钮时的回调
   */
  onUse?: (data: VariableTreeNodeType) => void;
  /**
   * 保存结点定义的回调
   */
  onSave?: NodeDefineProps['onSave'];
  /**
   * 删除结点定义的回调
   */
  onDeleteVariable?: (storeName: string, stateName: string) => void;
  /**
   * 删除模型时的回调
   */
  onDeleteStore?: (storeName: string) => void;
  /**
   * 高度
   */
  height?: number | string;
  /**
   * 搜索框的样式
   */
  searchStyle?: React.CSSProperties;
  /**
   * 搜索框的后置结点
   */
  searchAddonAfter?: React.ReactNode;
  /**
   * 是否展示预览值的提示信息
   */
  showPreviewAlert?: boolean;
}

const previewOptions = [
  { label: '运行时', value: 'preview' },
  { label: '定义', value: 'define' },
];

export function EditableVariableTree({
  height,
  searchAddonAfter,
  searchStyle,
  dataSource,
  onAddVariable = noop,
  onDeleteVariable = noop,
  onDeleteStore = noop,
  getPreviewValue = noop,
  onSelect = noop,
  onUse = noop,
  onSave = noop,
  modes = ['add', 'preview', 'define'],
  defaultMode = 'preview',
  showPreviewAlert = true,
}: EditableVariableTreeProps) {
  const [keyword, setKeyword] = useState('');
  const [node, setNode] = useState<VariableTreeNodeType>();
  const [mode, setMode] = useState<EditableVariableTreeProps['defaultMode']>(defaultMode);
  const hasPanelSwitch = modes.includes('define') && modes.includes('preview');

  const treeData = useMemo(() => {
    const pattern = new RegExp(keyword, 'ig');
    return keyword
      ? filterTreeData(dataSource, (leaf) => pattern.test(leaf.title), 'children', true)
      : dataSource;
  }, [keyword, dataSource]);

  return (
    <Box
      className="EditableVariableTree"
      display="flex"
      overflow="auto"
      height={height}
      position="relative"
    >
      <Box p="l" width="40%" borderRight="solid" borderColor="line.normal">
        <Box mb="m" position="sticky" top="0" bg="white" zIndex={2}>
          <Input.Group compact>
            <Search
              placeholder="请输入变量名"
              onChange={(val) => setKeyword(val?.trim())}
              style={searchStyle}
            />
            {searchAddonAfter}
          </Input.Group>
        </Box>
        <VariableTree
          dataSource={treeData}
          onSelect={(node) => {
            setNode(node);
            mode === 'add' && setMode(defaultMode);
            onSelect(node);
          }}
          onAdd={(node) => {
            setNode(node);
            setMode('add');
          }}
          onRemove={(node) => {
            const [type, storeName] = node.key.split('.');
            setNode(null);
            onDeleteStore(storeName);
          }}
        />
      </Box>
      {node ? (
        <Panel
          title={
            {
              preview: '变量值预览',
              add: '添加变量',
              define: '变量定义',
            }[mode]
          }
          extra={
            hasPanelSwitch && mode !== 'add' ? (
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                size="small"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                options={previewOptions}
              />
            ) : null
          }
          width="60%"
          borderRadius="m"
          position="sticky"
          top="0"
          bodyProps={{ px: 'l' }}
        >
          {mode === 'preview' && (
            <>
              <Box mb="m" display={showPreviewAlert ? 'block' : 'none'}>
                <Alert
                  message={
                    <Space>
                      <Text>
                        <Text as="strong">变量路径：</Text>tango.{node.key}
                      </Text>
                      <Link onClick={() => onUse(node)}>使用此变量</Link>
                      <CopyClipboard text={`tango.${node.key.replaceAll('.', '?.')}`}>
                        {(copied) => <Link>{copied ? '已复制' : '复制变量路径'}</Link>}
                      </CopyClipboard>
                    </Space>
                  }
                  type="info"
                />
              </Box>
              <ValuePreview
                value={getPreviewValue(node)}
                onSelect={(valuePath) => {
                  return ['tango', node.key.replaceAll('.', '?.'), valuePath].join('.');
                }}
              />
            </>
          )}
          {mode === 'define' && (
            <NodeDefineForm
              node={node}
              onSave={onSave}
              onDelete={(node) => {
                const [type, storeName, stateName] = node.key.split('.');
                onDeleteVariable(storeName, stateName);
                setNode(null);
              }}
            />
          )}
          {mode === 'add' && (
            <AddNodeForm
              parentNode={node}
              onCancel={() => {
                setMode(defaultMode);
                setNode(null);
              }}
              onSubmit={(storeName, data) => {
                onAddVariable(storeName, data);
                setMode(defaultMode);
                setNode(null);
              }}
            />
          )}
        </Panel>
      ) : (
        <Panel title="提示" flex="1" position="sticky" top="0">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请从左侧列表中选择一个变量" />
        </Panel>
      )}
    </Box>
  );
}

interface EditableVariableTreeModalProps extends EditableVariableTreeProps {
  trigger?: React.ReactElement;
  title?: ModalProps['title'];
  modalProps?: ModalProps;
}

export function EditableVariableTreeModal({
  trigger,
  title,
  modalProps,
  onSelect = noop,
  ...rest
}: EditableVariableTreeModalProps) {
  const [node, setNode] = useState<VariableTreeNodeType>();
  const [visible, { on, off }] = useBoolean(false);
  return (
    <Box>
      {React.cloneElement(trigger, { onClick: on })}
      <Modal
        title={title}
        visible={visible}
        onCancel={off}
        okButtonProps={{
          disabled: !node,
        }}
        onOk={() => {
          if (node) {
            onSelect(node);
            off();
          }
        }}
        width="60%"
        {...modalProps}
      >
        <EditableVariableTree height={480} onSelect={setNode} {...rest} />
      </Modal>
    </Box>
  );
}

const varTreeStyle = css`
  overflow: auto;

  .ant-tree {
    font-family: Consolas, Menlo, Courier, monospace;
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

interface VariableTreeProps {
  dataSource?: VariableTreeNodeType[];
  onSelect?: (data: VariableTreeNodeType) => void;
  onAdd?: (data: VariableTreeNodeType) => void;
  onRemove?: (data: VariableTreeNodeType) => void;
}

function VariableTree({
  dataSource = [],
  onSelect = noop,
  onAdd = noop,
  onRemove = noop,
}: VariableTreeProps) {
  return (
    <Box className="VariableTree" css={varTreeStyle}>
      <Tree.DirectoryTree
        showIcon={false}
        defaultExpandAll
        treeData={dataSource}
        onSelect={(keys, detail) => {
          onSelect(detail.node);
        }}
        titleRender={(node) => {
          if (node.showAddChildIcon || node.showRemoveIcon) {
            return (
              <Box display="flex" justifyContent="space-between" alignItems="center" pr="l">
                <Text>{node.title}</Text>
                <Box>
                  {node.showAddChildIcon && (
                    <Tooltip title={`向 ${node.title} 中添加变量`}>
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdd(node);
                        }}
                      />
                    </Tooltip>
                  )}
                  {node.showRemoveIcon && (
                    <Popconfirm
                      title="确认删除吗？该操作会导致引用此模型的代码报错，请谨慎操作！"
                      onConfirm={() => onRemove(node)}
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
                </Box>
              </Box>
            );
          }
          return (
            <Box>
              <Text mr="m">{node.title}</Text>
              {node.type === 'function' && <FunctionOutlined />}
            </Box>
          );
        }}
      />
    </Box>
  );
}

interface NodePreviewProps {
  value?: unknown;
  /**
   * 选择预览结点的回调
   */
  onSelect?: JsonViewProps['onCopy'];
}

export function ValuePreview({ value, onSelect }: NodePreviewProps) {
  if (isNil(value)) {
    return <span>暂时没有可预览的数据</span>;
  }

  if (isFunction(value)) {
    return <span>暂不支持预览函数</span>;
  }

  if (typeof value === 'object') {
    return <JsonView src={value} enableCopy onCopy={onSelect} />;
  }

  return (
    <InputCode
      shape="inset"
      value={isString(value) ? `"${value}"` : String(value)}
      editable={false}
    />
  );
}

interface NodeDefineProps {
  node: VariableTreeNodeType;
  onSave?: (code: string, node: VariableTreeNodeType) => void;
  onDelete?: (node: VariableTreeNodeType) => void;
}

/**
 * 变量值定义面板
 */
function NodeDefineForm({ node, onSave = noop, onDelete = noop }: NodeDefineProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [editable, { on, off }] = useBoolean();
  if (isNil(node.raw)) {
    return <Empty description="缺失定义数据" />;
  }
  return (
    <Box>
      <InputCode
        shape="inset"
        value={node.raw}
        onChange={(value) => setValue(value)}
        editable={editable}
        onBlur={() => {
          if (!isValidExpressionCode(value)) {
            setError('代码格式错误，请检查代码语法！');
          } else {
            setError('');
          }
        }}
      />
      <Box color="red" my="m">
        {error}
      </Box>
      <Box mt="l">
        {editable ? (
          <Space>
            <Button
              onClick={() => {
                off();
                setError('');
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (error) {
                  return;
                }

                onSave(value, node);
                off();
              }}
            >
              保存
            </Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={on}>编辑</Button>
            <Popconfirm
              title="确认删除此变量吗？该操作会导致引用该变量的代码报错！"
              onConfirm={() => {
                onDelete(node);
              }}
            >
              <Button danger>删除</Button>
            </Popconfirm>
          </Space>
        )}
      </Box>
    </Box>
  );
}

interface AddNodeFormProps {
  parentNode: VariableTreeNodeType;
  onCancel?: React.MouseEventHandler<HTMLButtonElement>;
  onSubmit?: (storeName: string, data: { name: string; initialValue: string }) => void;
}

function AddNodeForm({ parentNode, onCancel, onSubmit }: AddNodeFormProps) {
  return (
    <Form
      layout="vertical"
      autoComplete="off"
      validateTrigger="onBlur"
      onFinish={(values) => {
        if (onSubmit && parentNode) {
          const [type, storeName] = parentNode.key.split('.');
          onSubmit(storeName, values);
        }
      }}
    >
      <Form.Item label="所属模型">
        <Input value={parentNode?.key} disabled />
      </Form.Item>
      <Form.Item
        label="变量名"
        name="name"
        rules={[
          { required: true },
          { pattern: /^\w+$/, message: '非法的变量标识符' },
          {
            validator(_, value) {
              const found = parentNode.children.find((item) => item.title === value);
              return found
                ? Promise.reject(new Error('和已有变量名冲突，请换一个名字！'))
                : Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="请输入变量名" />
      </Form.Item>
      <Form.Item
        label="初值"
        name="initialValue"
        rules={[
          { required: true },
          {
            validator(_, value) {
              return isValidExpressionCode(value)
                ? Promise.resolve()
                : Promise.reject(new Error('代码存在语法错误，请输入合法的代码片段！'));
            },
          },
        ]}
      >
        <InputCode shape="inset" placeholder="请输入初值" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
