import React, { useMemo } from 'react';
import { observer, useWorkspace } from '@music163/tango-context';
import { ConfigGroup, ConfigItem } from '@music163/tango-ui';
import { Box, css } from 'coral-system';
import { Input, Switch, Form, Button, message, FormProps } from 'antd';
import { CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';

export default observer(() => {
  const workspace = useWorkspace();
  return (
    <ConfigGroup title="代理设置">
      <ConfigItem
        title="proxy"
        description="这里可以配置接口转发的代理规则"
        layoutDirection="column"
      >
        <ProxyManage
          initialValues={workspace.tangoConfigJson?.getValue('proxy')}
          onSave={(value) => {
            workspace.tangoConfigJson?.setValue('proxy', value).update();
            message.success('proxy 规则更新成功！');
          }}
        />
      </ConfigItem>
    </ConfigGroup>
  );
});

export const proxyRuleStyle = css`
  position: relative;
  border: 1px dashed #f0f0f0;
  padding-top: 24px;
  border-radius: 4px;
  margin-bottom: 8px;

  &:hover {
    border-color: var(--tango-colors-brand);
  }

  > .RuleRemoveBtn {
    position: absolute;
    top: 0;
    right: 0;
  }

  .RuleHeaderItem {
    margin-bottom: 10px;
  }
`;

export const proxyManageFormStyle: FormProps = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
  autoComplete: 'off',
  colon: false,
};

function ProxyManage({
  initialValues: initialValuesProp = {},
  onSave,
}: {
  initialValues?: object;
  onSave?: (values: any) => void;
}) {
  const initialValues = useMemo(() => {
    const proxy = Object.keys(initialValuesProp).reduce((prev, cur) => {
      prev.push({
        path: cur,
        ...initialValuesProp[cur],
      });
      return prev;
    }, []);
    return {
      proxy,
    };
  }, [initialValuesProp]);

  return (
    <Form
      {...proxyManageFormStyle}
      initialValues={initialValues}
      onFinish={(values) => {
        const proxy = values.proxy.reduce((prev: object, { path, ...rest }: any) => {
          prev[path] = rest;
          return prev;
        }, {});
        onSave?.(proxy);
      }}
    >
      <Form.List name="proxy">
        {(fields, { add, remove }) => {
          return (
            <>
              {fields.map((field) => (
                <Box key={field.key} css={proxyRuleStyle}>
                  <Button
                    className="RuleRemoveBtn"
                    type="link"
                    icon={<CloseOutlined />}
                    onClick={() => remove(field.name)}
                  />
                  <Form.Item
                    {...field}
                    key="path"
                    label="path"
                    name={[field.name, 'path']}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    key="target"
                    label="target"
                    name={[field.name, 'target']}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    key="changeOrigin"
                    label="changeOrigin"
                    name={[field.name, 'changeOrigin']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item label="请求头">
                    <Form.List name={[field.name, 'headers']}>
                      {(headerFields, { add: headerAdd, remove: headerRemove }) => {
                        return (
                          <>
                            {headerFields.map((headerField) => (
                              <Form.Item className="RuleHeaderItem" key={headerField.key}>
                                <Box gap="8px" display="flex">
                                  <Form.Item
                                    {...headerField}
                                    noStyle
                                    key="name"
                                    label="name"
                                    name={[headerField.name, 'name']}
                                    rules={[{ required: true }]}
                                  >
                                    <Input placeholder="Key" />
                                  </Form.Item>
                                  <Form.Item
                                    {...headerField}
                                    noStyle
                                    key="value"
                                    label="value"
                                    name={[headerField.name, 'value']}
                                    rules={[{ required: true }]}
                                  >
                                    <Input placeholder="Value" />
                                  </Form.Item>
                                  <Button
                                    type="link"
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => headerRemove(headerField.name)}
                                  />
                                </Box>
                              </Form.Item>
                            ))}
                            <a onClick={() => headerAdd()}>添加请求头</a>
                          </>
                        );
                      }}
                    </Form.List>
                  </Form.Item>
                </Box>
              ))}
              <Box mt="m" mb="l">
                <Button block type="dashed" onClick={() => add()}>
                  添加规则
                </Button>
              </Box>
            </>
          );
        }}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
}
