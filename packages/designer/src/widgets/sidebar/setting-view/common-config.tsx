import React from 'react';
import { ConfigGroup, ConfigItem } from '@music163/tango-ui';
import { useWorkspace, observer } from '@music163/tango-context';

const envList = [
  { label: '测试环境', value: 'test' },
  { label: '回归环境', value: 'reg' },
];

export default observer(() => {
  const workspace = useWorkspace();

  return (
    <div>
      <ConfigGroup title="设计器配置">
        <ConfigItem
          title="自动移除未使用的引入"
          description="在源码保存时自动移除代码中未被使用到的变量"
          component="switch"
          value={workspace.tangoConfigJson?.getValue('engine.autoRemoveUnusedImports')}
          onChange={(checked) => {
            workspace.tangoConfigJson
              ?.setValue('engine.autoRemoveUnusedImports', () => {
                return checked;
              })
              .update();
          }}
        />
      </ConfigGroup>
      <ConfigGroup title="平台服务配置">
        <ConfigItem
          title="自动部署"
          description="每次推送代码后自动触发 Febase 环境部署"
          layoutDirection="column"
          component="selectList"
          componentProps={{
            options: envList,
          }}
          value={workspace.tangoConfigJson?.getValue('platform.autoDeploy')}
          onChange={(value) => {
            workspace.tangoConfigJson?.setValue('platform.autoDeploy', value).update();
          }}
        />
        <ConfigItem
          title="自动推送"
          description="升级依赖后自动推送代码到 Gitlab"
          component="switch"
          value={workspace.tangoConfigJson?.getValue('platform.upgradeAutoPush')}
          onChange={(checked) => {
            workspace.tangoConfigJson?.setValue('platform.upgradeAutoPush', checked).update();
          }}
        />
      </ConfigGroup>
    </div>
  );
});
