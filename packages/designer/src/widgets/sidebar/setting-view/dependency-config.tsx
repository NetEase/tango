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
  Select,
  Space,
  message,
  Tag,
} from 'antd';
import { Box, Text } from 'coral-system';
import semverLt from 'semver/functions/lt';
import semverValid from 'semver/functions/valid';
import { ConfigGroup, ConfigItem } from '@music163/tango-ui';
import {
  BookOutlined,
  GitlabOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useBoolean } from '@music163/tango-helpers';
import { isUndefined } from 'lodash-es';
import { useRemoteServices, useSandboxQuery } from '../../../context';
import { Workspace } from '@music163/tango-core';

const { Option } = Select;

enum DependencyItemType {
  基础包 = 'base',
  业务组件 = 'biz',
  其他依赖 = 'other',
}

export interface DependencyConfigProps {
  onBizDependencyAdd?: Function;
  onBaseDependencyAdd?: Function;
}

export default observer(({ onBizDependencyAdd, onBaseDependencyAdd }: DependencyConfigProps) => {
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
  const remoteServices = useRemoteServices();
  const dependencies = workspace?.listDependencies();
  const packages = workspace?.tangoConfigJson?.getValue('packages');
  const packageNames = useMemo(() => Object.keys(packages || {}), [packages]);
  const bizDependencies = workspace?.bizComps;
  const baseDependencies = workspace?.baseComps;

  useEffect(() => {
    if (!workspace?.tangoConfigJson.getValue('type')) return;
    remoteServices?.DependencyService?.listBaseDependencies({
      type: workspace?.tangoConfigJson.getValue('type'),
    }).then((data: any) => setTemplateBaseDependencies(data));
  }, [workspace, remoteServices]);

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

  // 业务组件依赖
  const bizDeps = useMemo(
    () =>
      bizDependencies?.map((name: string) => ({
        name,
        version: dependencies[name] ?? packages?.[name]?.version,
        package: packages?.[name],
      })) || [],
    [bizDependencies, dependencies, packages],
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
          <>
            基础包&nbsp;
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
          </>
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
      <ConfigGroup
        title={
          <>
            业务组件&nbsp;
            <Tooltip
              title={
                <>
                  - 组件来源：
                  <a target="_blank" href="https://redstone.fn.netease.com/" rel="noreferrer">
                    红石平台
                  </a>
                  <br />
                  - 安装成功后，可到【组件 - 业务组件】面板进行拖拽
                  <br />- 升级默认升级到最新版本
                </>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </>
        }
        key={DependencyItemType.业务组件}
      >
        <ConfigItem layoutDirection="column">
          <DependencyList
            type={DependencyItemType.业务组件}
            dependencies={bizDeps}
            onUpgrade={onBizDependencyAdd}
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
});

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
  const [version, setVersion] = useState<string>();
  const [versionList, setVersionList] = useState<Array<{ label: string; value: string }>>([]);
  const [open, { on, off }] = useBoolean(false);

  const workspace = useWorkspace() as Workspace;
  const remoteServices = useRemoteServices();

  useEffect(() => {
    remoteServices?.DependencyService?.listPackageVersions({ packageName: record.name }).then(
      (data: any) => setVersionList((data || []).map((v: string) => ({ label: v, value: v }))),
    );
  }, [remoteServices, record]);

  const basePackage = useMemo(() => {
    if (type !== DependencyItemType.基础包 || !templateBaseDependencies) return undefined;
    return templateBaseDependencies[record.name];
  }, [type, templateBaseDependencies, record]);

  /**
   * 处理依赖升级的逻辑
   */
  function onDepUpgrade() {
    // 根据是否有 packages 字段，判断是否已升级为新的规范
    const hasUpgraded = !!workspace.tangoConfigJson?.getValue('packages');

    switch (type) {
      case DependencyItemType.业务组件:
      case DependencyItemType.其他依赖: {
        workspace.updateDependency(
          record.name,
          version,
          hasUpgraded
            ? {
                package: record?.package,
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
                package: record?.package,
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
    setVersion(undefined);
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
    const unsafeUmd =
      hasUmd && resources.some((e: string) => /\/\/unpkg\.f[nt]\.netease\.com\//.test(e));
    const packageJsonOnly = dependencies?.[name] && !packageInfo;
    const tangoConfigJsonOnly = !dependencies?.[name] && packageInfo;

    return [
      hasUmd && (
        <Tooltip title="该依赖拥有 UMD 资源，可优化加载速度">
          <Tag key="hasUmd" color="green">
            UMD
          </Tag>
        </Tooltip>
      ),
      unsafeUmd && (
        <Tooltip title="该依赖的 UMD 资源来自自建 unpkg 服务，稳定性不可靠，建议修改 tango.config.json 更换为正式 cdn 资源地址">
          <Tag key="unsafeUmd" color="orange">
            非 CDN
          </Tag>
        </Tooltip>
      ),
      packageJsonOnly && (
        <Tooltip title="此依赖只在 package.json 中存在">
          <Tag key="packageJsonOnly">package.json</Tag>
        </Tooltip>
      ),
      tangoConfigJsonOnly && (
        <Tooltip title="此依赖只在 tango.config.json 中存在">
          <Tag key="packageJsonOnly">tango.config.json</Tag>
        </Tooltip>
      ),
    ].filter((e) => e);
  }, [showTags, workspace, record]);

  return (
    <List.Item
      actions={
        type !== DependencyItemType.基础包
          ? [
              <a key="upgrade" onClick={on}>
                升级
              </a>,
              <Popconfirm onConfirm={onDepDelete} title={`确认删除依赖 ${record.name}？`}>
                <a key="delete">删除</a>
              </Popconfirm>,
            ]
          : baseNeedUpgrade
          ? [
              <Popconfirm
                title={`确认升级 ${record.name} 到 ${basePackage.version} 吗？`}
                onConfirm={onDepUpgrade}
              >
                <a key="upgrade">升级</a>
              </Popconfirm>,
            ]
          : [
              <Text color={'rgba(0, 0, 0, 0.45)'}>
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
      <Modal
        open={open}
        title={`升级依赖：${record.name}`}
        onCancel={onCloseModal}
        onOk={onDepUpgrade}
      >
        <Text mr="6px">
          选择依赖版本号&nbsp;
          <Tooltip title="只提供正式版本列表，Beta版本依赖需要手动升级">
            <QuestionCircleOutlined />
          </Tooltip>
        </Text>
        <Select
          style={{ width: 160 }}
          showSearch
          defaultValue={record.version}
          options={versionList || []}
          onChange={(value: string) => setVersion(value)}
          placeholder="请选择要升级的版本号"
          optionFilterProp="value"
        />
      </Modal>
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
}

function AddDependencyModal({
  templateBaseDependencies,
  onBizDependencyAdd,
  onBaseDependencyAdd,
}: DependencyModalProps) {
  // 依赖类型
  const [type, setType] = useState<DependencyItemType>(DependencyItemType.业务组件);
  // 业务（红石）组件列表
  const [bizList, setBizList] = useState();
  const [open, { on, off }] = useBoolean();
  // 组件版本列表
  const [versions, setVersions] = useState({});

  const [form] = Form.useForm();
  const workspace = useWorkspace();
  const sandbox = useSandboxQuery();
  const remoteServices = useRemoteServices();

  useEffect(() => {
    if (!remoteServices?.DependencyService || !workspace) return;
    const bizDeps = workspace?.bizComps;
    if (type === DependencyItemType.业务组件) {
      remoteServices?.DependencyService?.listBizDependencies().then((data: any) =>
        setBizList(data?.filter((item: any) => !bizDeps?.includes(item.packageName))),
      );
    }
  }, [type, remoteServices, workspace]);

  // 基础包列表
  const baseDependencies: string[] = useMemo(() => {
    if (!templateBaseDependencies || !workspace?.tangoConfigJson) return [];
    const baseDeps = workspace?.baseComps;
    return (Object.keys(templateBaseDependencies) || []).filter(
      (dep: string) => !baseDeps?.includes(dep),
    );
  }, [templateBaseDependencies, workspace]);

  const onFinishCallback = (name?: string) => {
    name && message.success(`${name} 添加成功`);
    // FIXME: 修复沙箱添加组件后 HMR 失效的 bug，添加完刷新
    sandbox.reload();
    off();
    form.resetFields();
  };

  const onOk = () => {
    form.validateFields().then((values) => {
      const { name, version } = values;
      // 根据是否有 packages 字段，判断是否已升级为新的规范
      const hasUpgraded = !!workspace.tangoConfigJson?.getValue('packages');

      switch (type) {
        case DependencyItemType.其他依赖: {
          workspace.updateDependency(name, version);
          break;
        }
        case DependencyItemType.业务组件: {
          const targetBizInfo = (bizList as any)?.find(
            (biz: { packageName: string }) => biz.packageName === name,
          );
          onBizDependencyAdd &&
            onBizDependencyAdd({
              ...values,
              detail: targetBizInfo,
            });
          break;
        }
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
    });
  };

  const onValuesChange = ({ type, name }: { type: DependencyItemType; name: string }) => {
    if (type) {
      // type 变更触发
      form.resetFields(['name', 'version']);
      setType(type);
    }
    if (name) {
      // 如果已经获取过了，不重复请求
      if ((versions || {})[name]) return;
      // name 变更触发包名请求
      remoteServices?.DependencyService.listPackageVersions({ packageName: name }).then((data) => {
        setVersions((preVersions) => {
          preVersions[name] = data || [];
          return Object.assign({}, preVersions);
        });
      });
    }
  };

  const onCloseModal = () => {
    off();
    form.resetFields(['name', 'version']);
  };

  return (
    <Box px="l" py="m">
      <Button ghost block type="primary" onClick={on}>
        <PlusOutlined />
        添加依赖
      </Button>
      <Modal
        width={560}
        open={open}
        title="添加依赖"
        onOk={onOk}
        onCancel={onCloseModal}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          initialValues={{ type: DependencyItemType.业务组件 }}
          onValuesChange={onValuesChange}
        >
          <Form.Item label="依赖类型" name="type">
            <Radio.Group value={type}>
              <Radio.Button value={DependencyItemType.业务组件}>业务组件</Radio.Button>
              <Radio.Button value={DependencyItemType.基础包}>基础包</Radio.Button>
              <Radio.Button value={DependencyItemType.其他依赖}>其他依赖</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={
              type === DependencyItemType.其他依赖
                ? 'npm包名'
                : type === DependencyItemType.业务组件
                ? '组件名称'
                : '基础包名'
            }
            name="name"
            tooltip={
              type === DependencyItemType.基础包 &&
              '基础包与模板相关联，可以联系管理员进行新增基础包操作'
            }
            rules={[{ required: true }]}
          >
            {type === DependencyItemType.其他依赖 ? (
              <Input placeholder="输入依赖名" />
            ) : type === DependencyItemType.业务组件 ? (
              <Select showSearch placeholder="请选择业务组件" optionFilterProp="value">
                {(bizList || []).map((biz) => (
                  <Option key={biz.packageName} value={biz.packageName}>
                    <Box display={'flex'} justifyContent={'space-between'}>
                      <Box>
                        {biz.packageName}
                        <Text ml={'4px'} fontSize="10px" color={'rgba(0, 0, 0, 0.45)'}>
                          {biz?.aliasCN || ''}
                        </Text>
                      </Box>
                      <Space>
                        <a target={'_blank'} href={biz.docAddress} rel="noreferrer">
                          <BookOutlined />
                        </a>
                        <a target={'_blank'} href={biz.gitAddress} rel="noreferrer">
                          <GitlabOutlined />
                        </a>
                      </Space>
                    </Box>
                  </Option>
                ))}
              </Select>
            ) : (
              <Select
                placeholder="请选择基础包"
                options={baseDependencies.map((name) => ({ label: name, value: name }))}
              />
            )}
          </Form.Item>
          {type !== DependencyItemType.基础包 && (
            <Form.Item
              label="版本号"
              name="version"
              rules={[{ required: true, message: '请输入依赖的版本号' }]}
            >
              <Select
                showSearch
                placeholder="请选择版本号"
                options={(versions[form.getFieldValue('name')] || []).map((v: string) => ({
                  label: v,
                  value: v,
                }))}
                optionFilterProp="value"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Box>
  );
}
