import React, { useMemo, useState } from 'react';
import { Button, Popconfirm, Modal, ModalProps, Form, Input } from 'antd';
import { Box, css, Group, Text } from 'coral-system';
import { FileOutlined, DeleteOutlined, CopyOutlined, SettingOutlined } from '@ant-design/icons';
import { array2object, callAll } from '@music163/tango-helpers';
import { IPageConfigData } from '@music163/tango-core';
import { ToggleButton } from '@music163/tango-ui';
import { observer, useWorkspace } from '@music163/tango-context';

export const RouteSwitchTool = observer(() => {
  const workspace = useWorkspace();
  return (
    <PageSelect
      options={workspace.pages}
      value={workspace.activeRoute}
      onSelect={(path) => {
        workspace.setActiveRoute(path);
      }}
      onRemove={(path) => {
        workspace.removeViewModule(path);
      }}
      onCopy={(...payloads) => workspace.copyViewPage(...payloads)}
      onUpdate={(...payloads) => workspace.updateRoute(...payloads)}
    />
  );
});

interface PageSelectProps {
  value?: string;
  onSelect?: (path: string) => void;
  onRemove?: PageListProps['onRemove'];
  onCopy?: PageListProps['onCopy'];
  onUpdate?: PageListProps['onUpdate'];
  options?: PageListProps['items'];
}

function PageSelect({ value, onSelect, onRemove, onUpdate, onCopy, options }: PageSelectProps) {
  const [visible, setVisible] = useState(false);
  const optionMap = useMemo(() => {
    return array2object(options, (item) => item.path);
  }, [options]);

  const handleChange = (next: string) => {
    if (typeof onSelect === 'function') {
      onSelect(next);
    }
    setVisible(false);
  };

  const current = optionMap[value];
  return (
    <ToggleButton
      shape="ghost"
      minWidth={100}
      dropdownProps={{
        open: visible,
        onOpenChange: setVisible,
      }}
      overlay={
        <PageList
          items={options}
          activeKey={value}
          onSelect={handleChange}
          onRemove={onRemove}
          onUpdate={onUpdate}
          onCopy={onCopy}
          onAction={(key) => {
            if (key !== 'delete') {
              setVisible(false);
            }
          }}
        />
      }
      icon={<FileOutlined />}
    >
      {current?.name || current?.label || value}
    </ToggleButton>
  );
}

const pageListStyle = css`
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
  user-select: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 12px;

    button {
      background: transparent;
      outline: none;
      border: 0;
    }

    &:hover {
      background-color: var(--tango-colors-gray-20);
    }

    &.active {
      background-color: var(--tango-colors-primary-20);
    }
  }
`;

interface PageListProps {
  activeKey?: string;
  items?: IPageConfigData[];
  onAction?: (key: 'delete' | 'copy' | 'update', e: React.MouseEvent) => void;
  onSelect?: (key: string) => void;
  onRemove?: (key: string) => void;
  onCopy?: (sourcePath: string, newPageData: IPageConfigData) => void;
  onUpdate?: (sourcePath: string, newPageData: IPageConfigData) => void;
}

// 表单编辑模式
type FormEditType = 'update' | 'copy';

function PageList({
  activeKey,
  items = [],
  onSelect,
  onRemove,
  onUpdate,
  onCopy,
  onAction,
}: PageListProps) {
  const [current, setCurrent] = useState<IPageConfigData>(null);
  const [type, setType] = useState<FormEditType>();
  return (
    <Box as="ul" bg="white" boxShadow="lowDown" borderRadius="m" css={pageListStyle}>
      {items.map((item) => (
        <Box
          as="li"
          key={item.path}
          gap="12px"
          onClick={() => {
            onSelect && onSelect(item.path);
          }}
          className={activeKey === item.path ? 'active' : undefined}
        >
          <FileOutlined />
          <Box flex="1">
            {item.name || '未命名'}
            <Text as="code" fontSize="12px" ml="m" color="gray.50">
              {item.path}
            </Text>
          </Box>
          <Group>
            {item.path !== '/' ? (
              <Popconfirm
                title="确认删除此页面吗？"
                onConfirm={(e) => {
                  e.stopPropagation();
                  onRemove && onRemove(item.path);
                }}
                zIndex={1060}
              >
                <Button
                  size="small"
                  type="link"
                  title="删除页面"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction?.('delete', e);
                  }}
                />
              </Popconfirm>
            ) : null}
            <Button
              size="small"
              type="link"
              title="复制页面"
              icon={<CopyOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(item);
                setType('copy');
                onAction?.('copy', e);
              }}
            />
            <Button
              size="small"
              type="link"
              title="设置页面"
              icon={<SettingOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(item);
                setType('update');
                onAction?.('update', e);
              }}
            />
          </Group>
        </Box>
      ))}
      <CopyViewModalForm
        key={current?.path}
        title={type === 'update' ? '更新当前页面' : '复制当前页面'}
        editType={type}
        items={items}
        visible={!!current}
        current={current}
        onOk={callAll(type === 'update' ? onUpdate : onCopy, () => {
          setCurrent(null);
        })}
        onCancel={() => {
          setCurrent(null);
        }}
      />
    </Box>
  );
}

interface CopyViewModalFormProps {
  title?: string;
  visible?: boolean;
  onOk?: (sourceRoute: string, targetRouteConfig: IPageConfigData) => void;
  onCancel?: ModalProps['onCancel'];
  current?: IPageConfigData;
  items?: IPageConfigData[];
  editType?: FormEditType;
}

function CopyViewModalForm({
  title,
  current,
  editType,
  items = [],
  visible,
  onOk,
  onCancel,
}: CopyViewModalFormProps) {
  const [form] = Form.useForm();
  return (
    <Modal
      title={title}
      visible={visible}
      destroyOnClose
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          onOk?.(current.path, values);
        });
      }}
    >
      <Form
        wrapperCol={{ span: 20 }}
        form={form}
        initialValues={{ name: current?.name, path: current?.path }}
      >
        <Form.Item label="页面标题" name="name" required>
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item
          label="页面路由"
          name="path"
          rules={[
            { required: true },
            editType !== 'update'
              ? {
                  validator: (_, v) => {
                    return items.map((item) => item.path).includes(v)
                      ? Promise.reject()
                      : Promise.resolve();
                  },
                  message: '重复的页面路由',
                }
              : undefined,
            {
              pattern: /^\/([A-Za-z0-9-:]*\/?)*$/,
              message: '非法的路由地址',
            },
          ]}
        >
          <Input placeholder="请输入页面路由" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
