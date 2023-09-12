import React, { useState } from 'react';
import { css, Box } from 'coral-system';
import { Form, Input, Button, Popover } from 'antd';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { DragBox } from '../components';

function copyWithoutUndefined(source: Record<string, any>) {
  const ret = {};
  for (const key in source) {
    if (source[key] !== undefined) {
      ret[key] = source[key];
    }
  }
  return ret;
}

export function useListSetter(props: FormItemComponentProps<any[]>) {
  const { value: valueProp = [], onChange: onChangeProp, ...rest } = props;

  const value = Array.isArray(valueProp) ? valueProp : [];

  const onChange = (next: any[] = []) => {
    onChangeProp && onChangeProp(next);
  };

  const getOnEdit = (index: number) => {
    return (data: any) => {
      const copy = [...value];
      copy[index] = data;

      onChange(copy);
    };
  };

  const getOnRemove = (index: number) => {
    return () => {
      const copy = [...value];

      copy.splice(index, 1);
      onChange(copy);
    };
  };

  const onAdd = (data: any) => {
    const next = [...value].concat([data]);

    onChange(next);
  };

  const onMove = (start: number, end: number) => {
    const copy = [...value];
    const temp = copy[end];

    copy[end] = copy[start];
    copy[start] = temp;

    onChange(copy);
  };

  return {
    value,
    onAdd,
    getOnEdit,
    getOnRemove,
    onMove,
    ...rest,
  };
}

const listItemStyle = css`
  display: flex;
  justify-content: space-between;
  border: 1px solid var(--tango-colors-line-normal);
  border-radius: var(--tango-radii-m);
  line-height: 2;
  padding-left: 12px;

  &:hover {
    background-color: var(--tango-colors-gray-10);
  }
`;

const leftCss = css`
  display: inline-block;

  .icon {
    margin-right: 8px;
    cursor: move;
  }
`;

interface ListSetterItemProps extends EditButtonProps {
  index?: number;
  onRemove?: () => void;
  children?: React.ReactNode;
  onMove?: Function;
}

export function ListSetterItem({
  children,
  onRemove,
  index = 0,
  onMove,
  ...rest
}: ListSetterItemProps) {
  return (
    <DragBox mb="m" index={index} css={listItemStyle} onMove={onMove}>
      <Box css={leftCss}>
        <HolderOutlined className="icon" />
        {children}
      </Box>
      <div>
        <EditButton {...rest} />
        <Button type="link" icon={<DeleteOutlined />} onClick={onRemove} />
      </div>
    </DragBox>
  );
}

interface EditButtonProps {
  formFields?: NewOptionFormProps['fields'];
  formInitialValues?: NewOptionFormProps['initialValues'];
  onEdit?: (values: any) => void;
}

function EditButton({ formFields, formInitialValues, onEdit }: EditButtonProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      visible={visible}
      onVisibleChange={setVisible}
      trigger="click"
      placement="leftTop"
      title="修改数据"
      content={
        <NewOptionForm
          fields={formFields}
          initialValues={formInitialValues}
          onSubmit={(values) => {
            onEdit && onEdit(values);
            setVisible(false);
          }}
        />
      }
    >
      <Button type="link" icon={<EditOutlined />} />
    </Popover>
  );
}

interface AddListItemButtonProps {
  formFields?: NewOptionFormProps['fields'];
  /**
   * @deprecated 使用 formInitialValues 代替
   */
  formInitialValues?: NewOptionFormProps['initialValues'];
  getFormInitialValues?: () => NewOptionFormProps['initialValues'];
  text?: string;
  onAdd?: (values: any) => void;
}

export function AddListItemButton({
  formFields = [],
  formInitialValues = {},
  getFormInitialValues,
  text = '添加一项',
  onAdd,
}: AddListItemButtonProps) {
  const [visible, setVisible] = useState(false);
  const initialValues = getFormInitialValues?.() ?? formInitialValues;
  return (
    <Popover
      destroyTooltipOnHide
      visible={visible}
      onVisibleChange={setVisible}
      trigger="click"
      placement="leftTop"
      title={text}
      content={
        <NewOptionForm
          fields={formFields}
          initialValues={initialValues}
          onSubmit={(values) => {
            onAdd && onAdd(values);
            setVisible(false);
          }}
        />
      }
    >
      <Button block>{text}</Button>
    </Popover>
  );
}

export type NewOptionFormFieldType = {
  label: string;
  name: string;
  required?: boolean;
  valuePropName?: string;
  component?: React.ReactNode;
  extra?: React.ReactNode;
  width?: string;
};

interface NewOptionFormProps {
  fields?: NewOptionFormFieldType[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function NewOptionForm({ fields = [], initialValues = {}, onSubmit }: NewOptionFormProps) {
  const [form] = Form.useForm();

  const onFinish = (values: Record<string, any>) => {
    onSubmit && onSubmit(copyWithoutUndefined(values));
  };

  return (
    <Form form={form} onFinish={onFinish} {...layout}>
      {fields.map((item) => (
        <Form.Item
          key={item.name}
          label={item.label}
          name={item.name}
          required={item.required}
          valuePropName={item.valuePropName}
          extra={item.extra}
          style={{
            width: item.width,
          }}
          initialValue={initialValues[item.name]}
        >
          {item.component || <Input placeholder="请输入" autoComplete="off" />}
        </Form.Item>
      ))}
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
}

interface ListSetterProps extends FormItemComponentProps<any[]> {
  listItemFormFields: ListSetterItemProps['formFields'];
  newItemDefaultValues?: AddListItemButtonProps['formInitialValues'];
  getNewItemDefaultValues?: AddListItemButtonProps['getFormInitialValues'];
  addBtnText?: string;
  getListItemKey?: (item: any) => React.Key;
  renderItem?: (item: any) => React.ReactNode;
};

const defaultListItemFormFields: ListSetterItemProps['formFields'] = [
  { label: 'key', name: 'key', required: true },
];

const defaultGetKey = (item: any) => item.key;

const defaultRenderItem = (item: any) => item.key;

/**
 * 列表项设置器
 */
export function ListSetter(props: ListSetterProps) {
  const {
    listItemFormFields = defaultListItemFormFields,
    newItemDefaultValues,
    getNewItemDefaultValues,
    addBtnText,
    getListItemKey = defaultGetKey,
    renderItem = defaultRenderItem,
    ...rest
  } = props;
  const { value, onAdd, getOnEdit, getOnRemove, onMove } = useListSetter(rest);

  return (
    <Box>
      <Box>
        {value.map((item, index) => {
          return (
            <ListSetterItem
              key={getListItemKey(item)}
              index={index}
              formFields={listItemFormFields}
              formInitialValues={item}
              onEdit={getOnEdit(index)}
              onRemove={getOnRemove(index)}
              onMove={onMove}
            >
              {renderItem(item)}
            </ListSetterItem>
          );
        })}
      </Box>
      <AddListItemButton
        text={addBtnText}
        formFields={listItemFormFields}
        formInitialValues={newItemDefaultValues}
        getFormInitialValues={getNewItemDefaultValues}
        onAdd={onAdd}
      />
    </Box>
  );
}
