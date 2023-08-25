import React, { useState, useEffect, useMemo } from 'react';
import { observer, useWorkspace } from '@music163/tango-context';
import { Box, Link, css } from 'coral-system';
import { Button, FormProps, Empty, Space, Dropdown } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { Form, InputCode, Menu, Panel, JsonView, Search } from '@music163/tango-ui';
import {
  isNil,
  isVariableString,
  getVariableContent,
  isValidFunctionCode,
  logger,
  code2object,
} from '@music163/tango-helpers';
import {
  ESFDataSourceType,
  ESFOperationType,
  ESFHTTPMethodType,
  ESFHTTRequestType,
} from '@music163/tango-core';
import { useSandboxQuery } from '../../../context';

/**
 * 将 api 路径转换为默认的驼峰方法名
 */
export const getApiDefaultName = (url: string) =>
  url
    // 去除 api + 模块名前缀
    // - 云音乐 api 规范为 /api/模块名/
    // - 后端公技基本使用 /模块名/api/
    // - 中台类服务似乎常用 /api/middle/模块名/
    // TODO: 是否需要去除模块名？一般同一个应用是同一个模块名，去掉可以缩减方法名长度，但确实有模块名不一样且后面的路径完全一致的接口
    // 目前的实现是去除了模块名，只干掉 /api/middle/ 和 /api/backend/ 这种常用前缀
    .replace(/^\/[^/]+?\/api\/|^\/api\/middle\/|^\/api\/backend\/|^\/api\//, '')
    // 去除路由参数
    .replace(/\/\{.*?\}/, '')
    // 忽略下划线与减号，将后面的字符转成大驼峰
    .replace(/[-/_]+\w/g, (str) => str.replace(/[-/_]+/, '').toUpperCase())
    // 首字母转小写
    .replace(/^./, (str) => str.toLowerCase())
    // 方法名以数字开头，添加 api 前缀
    .replace(/^\d/, (str) => `api${str}`);

type DataServiceViewProps = {
  onAdd?: (values: Record<string, string> | Array<Record<string, string>>) => void;
  onUpdate?: (values: Record<string, string>) => void;
  onDelete?: (values: Record<string, string>) => void;
};

// 判断是不是一个完整的 url 请求
const VALID_REQUEST_URL_REG = /((http|https):)?\/\/([\w.]+\/?)\S*/;

/**
 * 根据 url 类型推断方法类型
 */
export function inferServiceType(url?: string) {
  // 删除的时候，也会走一下这个逻辑，兼容
  if (!url) return ESFDataSourceType.Custom;
  // 如果是完整的，是 custom
  if (VALID_REQUEST_URL_REG.test(url)) return ESFDataSourceType.Custom;
  // 如果是 / 开头的，认为是 ox 的
  if (url.startsWith('/')) return ESFDataSourceType.OvermindX;
  /**
   * 这里预留出数据平台 fastX 的
   */
  // 默认是 ox 的
  return ESFDataSourceType.OvermindX;
}

// http 方法类型
const httpMethods = Object.keys(ESFHTTPMethodType).map((key) => ({
  label: key,
  value: key,
}));

// requestType 类型
const requestTypes = Object.keys(ESFHTTRequestType).map((key) => ({
  label: key,
  value: ESFHTTRequestType[key],
}));

const detailFormStyle = css`
  .ant-form-item {
    margin-bottom: 12px;
  }
`;

const buttonGroupStyle = css`
  width: 100%;

  button {
    width: 50%;
  }
`;

const DataSourceView = observer(({ onAdd, onUpdate, onDelete }: DataServiceViewProps) => {
  const [serviceKey, setServiceKey] = useState<string>();
  const [keyword, setKeyword] = useState<string>();
  const [visible, setVisible] = useState(null);
  const workspace = useWorkspace();
  const sandbox = useSandboxQuery();

  const serviceMap = workspace.serviceModule.serviceFunctions;
  const serviceItems = useMemo(() => {
    let list = Object.keys(serviceMap).map((key) => ({
      key,
      label: key,
      note: serviceMap[key].app || 'http',
      deletable: true,
      deletableConfirm: '确定删除此服务函数吗？',
    }));
    if (keyword) {
      list = list.filter((item) => item.label.includes(keyword));
    }
    return list;
  }, [serviceMap, keyword]);
  const serviceData = serviceMap[serviceKey];
  const isAddMode = !serviceKey;

  return (
    <Box
      className="DataSourceView"
      display="flex"
      borderTopColor="line.normal"
      height="100%"
      overflow="hidden"
    >
      <Box width="35%" overflow="auto" borderRight="solid" borderColor="line.normal">
        <Panel
          height="100%"
          bodyProps={{
            flex: 1,
          }}
        >
          <Box
            p="m"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            rowGap="m"
          >
            <Button
              block
              onClick={() => {
                setServiceKey(undefined);
                setVisible('detail');
              }}
            >
              新建服务函数
            </Button>
            <Search placeholder="搜索服务函数" onChange={setKeyword} />
          </Box>
          <Menu
            activeKey={serviceKey}
            items={serviceItems}
            onItemClick={(key) => {
              setServiceKey(key);
              setVisible('detail');
            }}
            onDelete={(key) => {
              const values = {
                name: key,
                ...workspace.serviceModule.serviceFunctions[key],
              };
              workspace.removeServiceFunction(key);
              onDelete && onDelete(values);
              setVisible(null);
            }}
          />
        </Panel>
      </Box>
      <Box width="65%" overflow="auto" css={detailFormStyle}>
        {visible === 'detail' && (
          <>
            <Panel title={isAddMode ? '新建服务函数' : '服务函数详情'}>
              <ServiceDetailForm
                key={serviceKey || 'createSF'}
                serviceKeys={Object.keys(serviceMap)}
                initialValues={
                  isAddMode
                    ? { type: ESFDataSourceType.OvermindX }
                    : {
                        name: serviceKey,
                        method: 'get',
                        type: inferServiceType(serviceData?.url),
                        ...serviceData,
                      }
                }
                onCancel={() => {
                  setServiceKey(undefined);
                  setVisible(null);
                }}
                onSubmit={(values, mode: ESFOperationType) => {
                  function shapeServiceValues(values: any) {
                    const shapeValues = { ...values };
                    delete shapeValues.type;
                    // 兼容旧版，如果 formatter 包裹了 {} 则删掉首尾
                    if (shapeValues.formatter && isVariableString(shapeValues.formatter)) {
                      shapeValues.formatter = getVariableContent(shapeValues.formatter);
                    }
                    return shapeValues;
                  }
                  // 移除掉不必要的属性
                  const data = shapeServiceValues(values);
                  if (mode === ESFOperationType.ADD) {
                    workspace.addServiceFunction(data);
                    onAdd && onAdd(values);
                  } else if (mode === ESFOperationType.UPDATE) {
                    workspace.updateServiceFunction(data);
                    onUpdate && onUpdate(values);
                  }
                  setServiceKey(values.name);
                }}
              />
            </Panel>
            {serviceKey ? (
              <ServiceFunctionPreview
                key={serviceKey}
                appContext={sandbox?.window['tango']}
                functionName={serviceKey}
              />
            ) : null}
          </>
        )}
        {!visible && (
          <Box py="xxl">
            <Empty description="请从左侧选择数据服务函数或新建数据服务函数" />
          </Box>
        )}
      </Box>
    </Box>
  );
});

interface ServiceDetailFormProps extends FormProps {
  serviceKeys?: string[];
  onCancel?: () => void;
  onSubmit?: (values: any, mode: ESFOperationType) => void;
}

function ServiceDetailForm({
  serviceKeys = [],
  onCancel,
  onSubmit,
  initialValues,
  ...formProps
}: ServiceDetailFormProps) {
  const isModifyMode = !!initialValues?.name; // 是否为更新模式
  const [disabled, setDisabled] = useState(isModifyMode);
  const [form] = Form.useForm();
  // 监听服务类型变化，默认是自定义
  const formType = Form.useWatch('type', form);

  // 新建的时候，类型变换重置部分字段
  useEffect(() => {
    if (!formType) return;
    !isModifyMode &&
      form.setFieldsValue({
        url: undefined,
        method: undefined,
        formatter: undefined,
      });
  }, [formType, form, isModifyMode]);

  return (
    <Form
      form={form}
      labelCol={6}
      wrapperCol={17}
      colon={false}
      layout="horizontal"
      initialValues={initialValues}
      onFinish={(values) => {
        onSubmit(values, isModifyMode ? ESFOperationType.UPDATE : ESFOperationType.ADD);
        setDisabled(true);
      }}
      {...formProps}
    >
      <Form.Item
        label="方法名"
        name="name"
        rules={[
          { required: true },
          { pattern: /^[a-z]\w+$/, message: '请输入合法的方法名称' },
          !isModifyMode && {
            validator(_, value) {
              const isExist = serviceKeys.includes(value);
              return isExist
                ? Promise.reject(new Error('重复的方法名，请换一个！'))
                : Promise.resolve();
            },
          },
        ]}
        component="input"
        componentProps={{
          placeholder: '请输入数据服务调用名称',
          disabled: disabled || isModifyMode,
        }}
        extra={
          !disabled &&
          !isModifyMode && (
            <Box>
              <Button
                type="link"
                size="small"
                disabled={!form.getFieldValue('url')}
                onClick={() => {
                  const funcName = getApiDefaultName(form.getFieldValue('url'));
                  form.setFieldValue('name', funcName);
                }}
              >
                使用接口路径自动生成
              </Button>
            </Box>
          )
        }
      />
      <Form.Item
        label="路径"
        name="url"
        rules={[{ required: true }]}
        component="input"
        componentProps={{
          placeholder: '请输入数据服务调用名称',
          disabled: disabled || isModifyMode,
        }}
      />
      <Form.Item
        label="方法"
        name="method"
        component="select"
        componentProps={{
          options: httpMethods,
          placeholder: '请选择 HTTP 请求方法',
          disabled,
        }}
      />
      <Form.Item
        label="编码类型"
        name="requestType"
        tooltip="设置请求头的 Content-Type，若不设置，则默认变为为 JSON"
        component="select"
        componentProps={{
          options: requestTypes,
          placeholder: '请求头Content-Type，默认为JSON',
          disabled,
        }}
      />
      <Form.Item
        label="格式化响应"
        name="formatter"
        tooltip={
          <Box>
            提供格式化函数，对结果进行格式化。请参考
            <Link
              href="https://music-doc.st.netease.com/st/tango-docs/docs/guide/basic/services#%E6%8E%A5%E5%8F%A3%E8%BF%94%E5%9B%9E%E5%80%BC%E8%A7%84%E8%8C%83"
              target="_blank"
            >
              云音乐接口规范
            </Link>
            。
          </Box>
        }
        validateTrigger="onBlur"
        rules={[
          {
            validator(_, value) {
              if (!value) {
                return Promise.resolve();
              }

              return isValidFunctionCode(value)
                ? Promise.resolve()
                : Promise.reject(new Error('请提供合法的函数代码！'));
            },
          },
        ]}
        extra={
          !disabled && (
            <Box>
              <Dropdown
                menu={{
                  items: [
                    { label: '直接返回（默认）', key: 'res => res' },
                    { label: '返回数据部分（云音乐标准规范）', key: 'res => res.data' },
                  ],
                  onClick: ({ key }) => {
                    form.setFieldValue('formatter', key);
                  },
                }}
              >
                <Button type="link" size="small">
                  使用模板函数
                </Button>
              </Dropdown>
            </Box>
          )
        }
      >
        <InputCode editable={!disabled} showLineNumbers placeholder="res => res" />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        {isModifyMode ? (
          <Space>
            {!disabled ? (
              <>
                <Button
                  onClick={() => {
                    setDisabled(true);
                  }}
                >
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  修改
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setDisabled(false);
                }}
              >
                编辑
              </Button>
            )}
          </Space>
        ) : (
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Space>
        )}
      </Form.Item>
    </Form>
  );
}

interface ServicePreviewProps {
  data?: object;
}

function ServicePreview({ data }: ServicePreviewProps) {
  let ret: React.ReactNode;

  if (!isNil(data)) {
    switch (typeof data) {
      case 'object':
        ret = <JsonView src={data as object} />;
        break;
      default:
        ret = String(data);
        break;
    }
  }

  const initialRet = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <Box
      className="ServicePreviewPanel"
      overflow="auto"
      height="auto"
      minHeight={260}
      marginTop={10}
    >
      {ret || initialRet}
    </Box>
  );
}

interface ServiceFunctionPreviewProps {
  appContext?: any;
  functionName?: string;
}

function ServiceFunctionPreview({ appContext, functionName }: ServiceFunctionPreviewProps) {
  const [payload, setPayload] = useState({});
  const [result, setResult] = useState<any>();
  const [error, setError] = useState('');
  return (
    <Panel
      title="接口测试"
      extra={
        <Space>
          <Button
            disabled={!appContext}
            size="small"
            onClick={() => {
              if (!appContext) {
                setError('执行上下文未准备好，请关闭面板重试');
                return;
              }
              try {
                appContext.services[functionName](payload).then((data: any) => {
                  setResult(data);
                });
              } catch (err) {
                setError('接口调用失败，请检查参数是否正确');
                logger.error(err);
              }
            }}
            icon={<PlayCircleOutlined />}
          >
            预览
          </Button>
        </Space>
      }
      borderTop="solid"
      borderTopColor="line.normal"
    >
      <Panel title="请求参数" bodyProps={{ px: 'l' }}>
        <InputCode
          placeholder={'添加请求参数，对象格式，如 { key: value }'}
          editable
          showLineNumbers
          onChange={(value: string) => {
            const obj = code2object(value);
            setPayload(obj);
          }}
        />
      </Panel>
      <Panel title="请求响应" bodyProps={{ px: 'l' }}>
        {error || (result ? <ServicePreview data={result} /> : '点击预览按钮测试接口返回值')}
      </Panel>
    </Panel>
  );
}

export default DataSourceView;
