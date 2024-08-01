import React, { useEffect, useReducer } from 'react';
import { observer } from '@music163/tango-context';
import { Dict, isFunction, isObject, pick } from '@music163/tango-helpers';
import { CollapsePanel, IconButton, JsonView } from '@music163/tango-ui';
import { ReloadOutlined } from '@ant-design/icons';
import { useSandboxQuery } from '../../context';

function processTango(obj: Dict = {}, index = 0) {
  const ret: Dict = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (index > 2) {
      ret[key] = val;
    } else if (isFunction(val)) {
      ret[key] = '[Function]';
    } else if (isObject(val)) {
      ret[key] = processTango(val, index + 1);
    } else {
      ret[key] = val;
    }
  });
  return ret;
}

export const StateTree = observer(() => {
  const sandboxQuery = useSandboxQuery();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const tangoContext = pick((sandboxQuery.window as any)['tango'] || {}, [
    'stores',
    'pageStore',
    'services',
    'config',
    'routeData',
  ]);
  const callback = () => {
    forceUpdate();
  };
  useEffect(() => {
    // FIXME: 优化这段代码，应该监听 tangoContext 的变化，来刷新
    const settingForm = document.querySelector('.SettingPanel');
    const ob = new MutationObserver(callback);
    if (settingForm) {
      ob.observe(settingForm, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
    return () => {
      ob.disconnect();
    };
  }, []);
  return (
    <CollapsePanel
      title="页面状态"
      stickyHeader
      maxHeight="90%"
      overflowY="auto"
      extra={
        <IconButton
          tooltip="同步状态"
          size="small"
          icon={<ReloadOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            forceUpdate();
          }}
        />
      }
    >
      <JsonView
        src={processTango(tangoContext)}
        collapsed={1}
        name="tango"
        displayObjectSize={false}
        indentWidth={2}
        enableCopy
      />
    </CollapsePanel>
  );
});
