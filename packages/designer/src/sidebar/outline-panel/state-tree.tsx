import React, { useEffect, useReducer } from 'react';
import { observer } from '@music163/tango-context';
import { isFunction, isObject, pick } from '@music163/tango-helpers';
import { JsonView } from '@music163/tango-ui';
import { useSandboxQuery } from '../../context';

function processTango(obj: any = {}, index = 0) {
  const ret = {};
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
  const tangoContext = pick(sandboxQuery.window['tango'] || {}, [
    'stores',
    'refs',
    'services',
    'config',
  ]);
  const callback = () => {
    forceUpdate();
  };
  useEffect(() => {
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
    <JsonView
      src={processTango(tangoContext)}
      collapsed={1}
      name="tango"
      displayObjectSize={false}
      indentWidth={2}
      enableCopy
    />
  );
});
