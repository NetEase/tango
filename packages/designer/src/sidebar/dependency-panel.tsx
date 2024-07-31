import React, { useEffect, useMemo, useState } from 'react';
import { observer, useWorkspace } from '@music163/tango-context';
import {
  Button,
  Input,
  Modal,
  Form,
  List,
  Tooltip,
  Popconfirm,
  Radio,
  message,
  Checkbox,
  ModalProps,
} from 'antd';
import { FormListProps } from 'antd/lib/form';
import { Box, Text } from 'coral-system';
import semverLt from 'semver/functions/lt';
import semverValid from 'semver/functions/valid';
import { ColorTag, ConfigGroup, ConfigItem } from '@music163/tango-ui';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useBoolean } from '@music163/tango-helpers';
import { isUndefined } from 'lodash-es';
import { useSandboxQuery } from '../context';

enum DependencyItemType {
  基础包 = 'base',
  业务组件 = 'biz',
  其他依赖 = 'other',
}

export interface DependencyPanelProps {
  onBizDependencyAdd?: Function;
  onBaseDependencyAdd?: Function;
}

export const DependencyPanel = observer(
  ({ onBizDependencyAdd, onBaseDependencyAdd }: DependencyPanelProps) => {
    // baseDependencies
    const [templateBaseDependencies, setTemplateBaseDependencies] = useState<
      Record<
        string,
        {
          description: string;
          [propName: string]: any;
        }
      >
    >();
    const workspace = useWorkspace();
    const dependencies = workspace?.listDependencies();
    const packages = workspace?.tangoConfigJson?.getValue('packages');
    const packageNames = useMemo(() => Object.keys(packages || {}), [packages]);
    const bizDependencies = workspace?.bizComps;
    const baseDependencies = workspace?.baseComps;

    // 其他依赖
    const otherDeps = useMemo(
      () =>
        // 优先展示 tango.config.json 的依赖，以表明 umd 资源的加载顺序
        [...new Set([...packageNames, ...Object.keys(dependencies || {})])]
          .filter((key) => !baseDependencies?.includes(key) && !bizDependencies?.includes(key))
          .map((key) => ({
            name: key,
            version: dependencies?.[key] ?? packages?.[key]?.version,
            package: packages?.[key],
          })),
      [dependencies, baseDependencies, bizDependencies, packages, packageNames],
    );

    // 基础包
    const baseDeps = useMemo(
      () =>
        baseDependencies?.map((name: string) => ({
          name,
          version: dependencies[name] ?? packages?.[name]?.version,
          description: (templateBaseDependencies || {})[name]?.description,
          package: packages?.[name],
        })) || [],
      [baseDependencies, dependencies, templateBaseDependencies, packages],
    );

    return (
      <Box>
        <AddDependencyModal
          templateBaseDependencies={templateBaseDependencies}
          onBizDependencyAdd={onBizDependencyAdd}
          onBaseDependencyAdd={onBaseDependencyAdd}
        />
        <ConfigGroup
          title={
            <div>
              基础包
              <Tooltip
                title={
                  <>
                    - 基础包不能被删除
                    <br />
                    - 升级默认升级到最新版本
                    <br />- 如果想新增对应模板基础包，请联系管理员
                  </>
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </div>
          }
          key={DependencyItemType.基础包}
        >
          <ConfigItem layoutDirection="column">
            <DependencyList
              templateBaseDependencies={templateBaseDependencies}
              type={DependencyItemType.基础包}
              dependencies={baseDeps}
              onUpgrade={onBaseDependencyAdd}
            />
          </ConfigItem>
        </ConfigGroup>
        <ConfigGroup title="其他依赖" key={DependencyItemType.其他依赖}>
          <ConfigItem layoutDirection="column">
            <DependencyList type={DependencyItemType.其他依赖} dependencies={otherDeps} />
          </ConfigItem>
        </ConfigGroup>
      </Box>
    );
  },
);

interface DependencyItemProps {
  name?: string;
  version?: string;
  description?: string;
  package?: { [x: string]: any };
}

interface DependencyListProps {
  type: string;
  dependencies: DependencyItemProps[];
  templateBaseDependencies?: Record<
    string,
    {
      description: string;
      [propName: string]: any;
    }
  >;
  onUpgrade?: Function;
}

interface RenderItemProps {
  type: string;
  record: DependencyItemProps;
  templateBaseDependencies?: Record<
    string,
    {
      description: string;
      [propName: string]: any;
    }
  >;
  onUpgrade?: Function;
  showTags?: boolean;
}

function RenderItem({
  type,
  record,
  templateBaseDependencies,
  onUpgrade,
  showTags = true,
}: RenderItemProps) {
  const [open, { on, off }] = useBoolean(false);

  const workspace = useWorkspace();

  const basePackage = useMemo(() => {
    if (type !== DependencyItemType.基础包 || !templateBaseDependencies) return undefined;
    return templateBaseDependencies[record.name];
  }, [type, templateBaseDependencies, record]);

  /**
   * 处理依赖升级的逻辑
   */
  function onDepUpgrade(values: Record<string, any>) {
    // 根据是否有 packages 字段，判断是否已升级为新的规范
    const hasUpgraded = !!workspace.tangoConfigJson?.getValue('packages');
    const { version, umd, library, resources, designerResources } = values || {};

    let packageConfig = record?.package;
    if (umd === false && packageConfig) {
      packageConfig = {
        ...packageConfig,
        version,
        library: undefined,
        resources: undefined,
        designerResources: undefined,
      };
    } else {
      packageConfig = {
        ...packageConfig,
        version,
        library,
        resources,
        designerResources,
      };
    }

    switch (type) {
      case DependencyItemType.业务组件:
      case DependencyItemType.其他依赖: {
        workspace.updateDependency(
          record.name,
          version,
          hasUpgraded
            ? {
                package: packageConfig,
              }
            : {},
        );
        message.success(`依赖 ${record.name} 升级成功`);
        onCloseModal();
        break;
      }
      case DependencyItemType.基础包: {
        // 处理 package.json
        workspace.updateDependency(
          record.name,
          basePackage?.version || 'latest',
          hasUpgraded
            ? {
                package: packageConfig,
              }
            : {},
        );

        // 配置已经合并为新版，不需要走旧的逻辑
        if (!hasUpgraded) {
          // 更新 tango.config.json externalResources
          workspace.tangoConfigJson
            .setValue('sandbox.externalResources', (targetValue) => {
              // 需要被替换的位置
              const replaceIndex = (targetValue as string[]).findIndex((resource: string) =>
                resource.includes(record.name),
              );
              // 需要被替换的元素，可能有多个，比如物料既有 js 又有 css
              const replaceArr =
                (targetValue as string[]).filter((resource: string) =>
                  resource.includes(record.name),
                ) || [];
              (targetValue as string[]).splice(
                replaceIndex,
                replaceArr.length,
                ...basePackage.resources.map((resource: string) =>
                  resource.replace('{latest_version}', basePackage.version),
                ),
              );
              return targetValue;
            })
            .update();
        }
        message.success(`依赖 ${record.name} 升级成功`);
        break;
      }
      default:
        break;
    }

    if (onUpgrade) {
      onUpgrade({
        type,
        name: record.name,
        version,
        detail: record,
      });
    }
  }

  /**
   * 处理依赖删除的逻辑
   */
  function onDepDelete() {
    switch (type) {
      case DependencyItemType.业务组件: {
        // 移除 package.json
        workspace.removeBizComp(record.name);
        message.success(`依赖 ${record.name} 移除成功`);
        break;
      }
      case DependencyItemType.其他依赖:
      case DependencyItemType.基础包: {
        workspace.removeDependency(record.name);
        message.success(`依赖 ${record.name} 移除成功`);
        break;
      }
      default:
        break;
    }
  }

  function onCloseModal() {
    off();
  }

  const baseNeedUpgrade: undefined | boolean = useMemo(() => {
    if (type !== DependencyItemType.基础包 || !basePackage || !record) return;
    // 非法版本号，比如 'latest'，会报错，直接默认升级走升级替换为最新版本
    if (!semverValid(record.version)) return true;
    return semverLt(record.version, basePackage.version);
  }, [type, basePackage, record]);

  const tags = useMemo(() => {
    const packages = workspace.tangoConfigJson?.getValue('packages');
    // 旧配置格式化不展示
    if (!showTags || !packages) {
      return false;
    }

    const { name, package: packageInfo } = record;
    const { resources } = packageInfo || {};
    const dependencies = workspace.packageJson?.getValue('dependencies');
    const hasUmd = !!resources?.length;
    const packageJsonIncluded = !!dependencies?.[name];
    const tangoConfigJsonIncluded = !!packageInfo;

    return (
      <Box display="inline-block">
        {hasUmd && (
          <ColorTag key="hasUmd" color="green" tooltip="该依赖拥有 UMD 资源，可优化加载速度">
            UMD
          </ColorTag>
        )}
        {packageJsonIncluded && <ColorTag tooltip="此依赖在 package.json 中存在">package</ColorTag>}
        {tangoConfigJsonIncluded && (
          <ColorTag tooltip="此依赖在 tango.config.json 中存在">tango.config</ColorTag>
        )}
      </Box>
    );
  }, [showTags, workspace, record]);

  return (
    <List.Item
      actions={
        type !== DependencyItemType.基础包
          ? [
              <a key="upgrade" onClick={on}>
                修改
              </a>,
              <Popconfirm onConfirm={onDepDelete} title={`确认删除依赖 ${record.name}？`}>
                <a key="delete">删除</a>
              </Popconfirm>,
            ]
          : baseNeedUpgrade
            ? [
                <Popconfirm
                  title={`确认升级 ${record.name} 到 ${basePackage.version} 吗？`}
                  onConfirm={() => onDepUpgrade({ version: basePackage.version })}
                >
                  <a key="upgrade">升级</a>
                </Popconfirm>,
              ]
            : [
                <Text key="latest" color={'rgba(0, 0, 0, 0.45)'}>
                  {!isUndefined(baseNeedUpgrade) && '已是最新'}
                </Text>,
              ]
      }
    >
      <List.Item.Meta
        title={
          <Text>
            {record.name}
            <Text ml={6} fontSize={'10px'} color={'rgba(0, 0, 0, 0.45)'}>
              {semverValid(record.version) && record.version}
            </Text>
            {showTags && <Text ml={6}>{tags}</Text>}
          </Text>
        }
        description={
          <Text
            dangerouslySetInnerHTML={{ __html: record?.package?.description || record.description }}
          />
        }
      />
      <DependencyConfigModal
        open={open}
        record={record}
        onCancel={onCloseModal}
        onOk={(event, { values }) => onDepUpgrade(values)}
      />
    </List.Item>
  );
}

function DependencyList({
  type,
  dependencies,
  templateBaseDependencies,
  onUpgrade,
}: DependencyListProps) {
  return (
    <List
      style={{ paddingTop: 0 }}
      size="small"
      dataSource={dependencies}
      renderItem={(record: DependencyItemProps) => (
        <RenderItem
          type={type}
          record={record}
          templateBaseDependencies={templateBaseDependencies}
          onUpgrade={onUpgrade}
        />
      )}
    />
  );
}

interface DependencyModalProps {
  templateBaseDependencies: Record<string, any>;
  onBizDependencyAdd: Function;
  onBaseDependencyAdd: Function;
  record?: Record<string, any>;
}

function AddDependencyModal({
  templateBaseDependencies,
  onBizDependencyAdd,
  onBaseDependencyAdd,
  record,
  ...rest
}: DependencyModalProps & ModalProps) {
  // 依赖类型
  const [open, { on, off }] = useBoolean();

  const workspace = useWorkspace();
  const sandbox = useSandboxQuery();
  const hasUpgraded = !!workspace.tangoConfigJson?.getValue('packages');

  const onFinishCallback = (name?: string) => {
    name && message.success(`${name} 添加成功`);
    // TIP: 修复沙箱添加组件后 HMR 失效的 bug，添加完刷新
    sandbox.reload();
    off();
  };

  const onOk: DependencyConfigModalProps['onOk'] = (event, { values }) => {
    const { type, name, version, umd, library, resources, designerResources } = values;

    switch (type) {
      case DependencyItemType.其他依赖: {
        workspace.updateDependency(
          name,
          version,
          hasUpgraded && umd
            ? {
                package: {
                  type: 'dependency',
                  ...record?.package,
                  version,
                  library,
                  resources,
                  designerResources,
                },
              }
            : {},
        );
        break;
      }
      // case DependencyItemType.业务组件: {
      //   const targetBizInfo = (bizList as any)?.find(
      //     (biz: { packageName: string }) => biz.packageName === name,
      //   );
      //   onBizDependencyAdd &&
      //     onBizDependencyAdd({
      //       ...values,
      //       detail: targetBizInfo,
      //     });
      //   break;
      // }
      case DependencyItemType.基础包: {
        const basePackage = templateBaseDependencies[name];
        // 添加 package.json
        workspace.updateDependency(
          name,
          basePackage.version || 'latest',
          hasUpgraded
            ? {
                package: basePackage.package,
              }
            : {},
        );

        // 配置已经合并为新版，不需要走旧的逻辑
        if (!hasUpgraded) {
          // 更新 tango.config.json baseDependencies
          workspace.tangoConfigJson.setValue('baseDependencies', (targetValue) => {
            const bases = targetValue || [];
            (bases as string[]).push(name);
            return bases;
          });
          // 更新 tango.config.json externals
          workspace.tangoConfigJson.setValue('sandbox.externals', (targetValue) => {
            targetValue[name] = basePackage?.global;
            return targetValue;
          });
          // 更新 tango.config.json externalResources
          workspace.tangoConfigJson
            .setValue('sandbox.externalResources', (targetValue) => {
              basePackage.resources.forEach((resource: string) => {
                (targetValue as string[]).push(
                  resource.replace('{latest_version}', basePackage.version),
                );
              });
              return targetValue;
            })
            .update();
        }
        onBaseDependencyAdd && onBaseDependencyAdd(basePackage);
        break;
      }
      default:
        break;
    }
    onFinishCallback(values?.name);
  };

  function onCloseModal() {
    off();
  }

  return (
    <Box px="l" py="m">
      <Button ghost block type="primary" onClick={on}>
        <PlusOutlined />
        添加依赖
      </Button>
      <DependencyConfigModal
        open={open}
        title={record ? `修改依赖：${record.name}` : '添加依赖'}
        onOk={onOk}
        onCancel={onCloseModal}
        destroyOnClose
        {...rest}
      />
    </Box>
  );
}

type DependencyConfigModalProps = Omit<ModalProps, 'onOk'> & {
  record?: Record<string, any>;
  onOk: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    data: {
      values: Record<string, any>;
      hasUpgraded: boolean;
    },
  ) => any;
};

function ResourceFormList(props: Omit<FormListProps, 'children'>) {
  return (
    <Form.List {...props}>
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields.map((field) => (
            <Form.Item key={field.key}>
              <Box display="flex" alignItems="center">
                <Form.Item
                  label="资源地址"
                  {...field}
                  rules={[{ required: true, whitespace: true, type: 'url' }]}
                  noStyle
                >
                  <Input
                    placeholder="资源地址中的版本号可用 {{version}} 替代"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Box width="20px" fontSize="18px" ml="6px" textAlign="center" flex="none">
                  <a onClick={() => remove(field.name)}>
                    <MinusCircleOutlined />
                  </a>
                </Box>
              </Box>
            </Form.Item>
          ))}
          <Button type="dashed" onClick={() => add()} block>
            添加
          </Button>
          <Form.ErrorList errors={errors} />
        </>
      )}
    </Form.List>
  );
}

function DependencyConfigModal({
  record,
  open,
  onOk,
  onCancel,
  ...rest
}: DependencyConfigModalProps) {
  // 依赖类型
  const [type, setType] = useState<DependencyItemType>(DependencyItemType.其他依赖);
  const [form] = Form.useForm();
  const workspace = useWorkspace();
  // 根据是否有 packages 字段，判断是否已升级为新的规范
  const hasUpgraded = !!workspace.tangoConfigJson?.getValue('packages');
  // const [versionList, setVersionList] = useState<Array<{ label: string; value: string }>>([]);

  // const remoteServices = useRemoteServices();

  // useEffect(() => {
  //   remoteServices?.DependencyService?.listPackageVersions({ packageName: record.name }).then(
  //     (data: any) => setVersionList((data || []).map((v: string) => ({ label: v, value: v }))),
  //   );
  // }, [remoteServices, record]);

  useEffect(() => {
    if (open && form) {
      form.resetFields();
      if (record) {
        setType(record?.type);
        form.setFieldsValue({
          ...record,
          ...record?.package,
          umd: !!record?.package?.resources?.length,
        });
      }
    }
  }, [record, open, form]);

  const onSubmit = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    form.validateFields().then((values) => {
      if (onOk) {
        onOk(event, {
          values,
          hasUpgraded,
        });
      }
    });
  };

  const onValuesChange = ({ type: depType }: { type: DependencyItemType; name: string }) => {
    if (depType) {
      // type 变更触发
      form.resetFields();
      form.setFieldValue('type', depType);
      setType(depType);
    }
  };

  return (
    <>
      <Modal
        width={560}
        open={open}
        title={record ? `修改依赖：${record.name}` : '添加依赖'}
        onOk={onSubmit}
        onCancel={onCancel}
        destroyOnClose
        {...rest}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          initialValues={{ type }}
          onValuesChange={onValuesChange}
        >
          {!record && (
            <>
              <Form.Item label="依赖类型" name="type" rules={[{ required: true }]}>
                <Radio.Group>
                  {/* <Radio.Button value={DependencyItemType.业务组件}>业务组件</Radio.Button> */}
                  <Radio.Button value={DependencyItemType.基础包}>基础包</Radio.Button>
                  <Radio.Button value={DependencyItemType.其他依赖}>其他依赖</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="npm 包名" name="name" rules={[{ required: true }]}>
                <Input placeholder="输入依赖名" />
              </Form.Item>
            </>
          )}
          <Form.Item
            label="版本号"
            name="version"
            rules={[{ required: true, message: '请输入依赖的版本号' }]}
          >
            <Input placeholder="输入版本号" />
          </Form.Item>
          {hasUpgraded && (
            <Form.Item name="umd" valuePropName="checked">
              <Checkbox>使用预构建 UMD 资源</Checkbox>
            </Form.Item>
          )}
          <Form.Item noStyle shouldUpdate>
            {() =>
              form.getFieldValue('umd') && (
                <>
                  <Form.Item label="全局变量名" name="library">
                    <Input placeholder="输入 UMD 资源挂载在全局变量下的变量名" />
                  </Form.Item>
                  <Form.Item label="资源地址" required>
                    <ResourceFormList
                      name="resources"
                      rules={[
                        {
                          validator: async (rule, value) => {
                            if (!value?.length) {
                              throw new Error('资源地址不能为空');
                            }
                          },
                        },
                      ]}
                    />
                  </Form.Item>
                  {form.getFieldValue('type') === DependencyItemType.基础包 && (
                    <Form.Item label="设计器资源地址">
                      <ResourceFormList name="designerResources" />
                    </Form.Item>
                  )}
                </>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
