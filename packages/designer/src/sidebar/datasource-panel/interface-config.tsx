import React from 'react';
import { observer, useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { Box } from 'coral-system';
import { getVariableContent, parseServiceVariablePath } from '@music163/tango-helpers';
import { isWrappedByExpressionContainer } from '@music163/tango-core';
import { VariableTree } from '../../components';
import { useSandboxQuery } from '../../context';

// 移除掉不必要的属性
export function shapeServiceValues(val: any) {
  const shapeValues = { ...val };
  delete shapeValues.type;
  // 兼容旧版，如果 formatter 包裹了 {} 则删掉首尾
  if (shapeValues.formatter && isWrappedByExpressionContainer(shapeValues.formatter)) {
    shapeValues.formatter = getVariableContent(shapeValues.formatter);
  }
  return shapeValues;
}

const DataSourceView = observer(() => {
  const sandbox = useSandboxQuery();
  const workspace = useWorkspace();
  const { serviceVariables } = useWorkspaceData();
  const serviceModules = Object.keys(workspace.serviceModules).map((key) => ({
    label: key === 'index' ? '默认模块' : key,
    value: key,
  }));

  return (
    <Box className="ServiceFunctionList" p="m">
      <VariableTree
        dataSource={serviceVariables}
        appContext={sandbox?.window['tango']}
        serviceModules={serviceModules}
        onRemoveVariable={(variableKey) => {
          workspace.removeServiceFunction(variableKey);
        }}
        onAddService={(data) => {
          const { name, moduleName, ...payload } = shapeServiceValues(data);
          workspace.addServiceFunction(name, payload, moduleName);
        }}
        onUpdateService={(data) => {
          const { name, moduleName, ...payload } = shapeServiceValues(data);
          workspace.updateServiceFunction(name, payload, moduleName);
        }}
        getServiceData={(serviceKey) => {
          const data = workspace.getServiceFunction(serviceKey);
          return {
            name: data.name,
            moduleName: data.moduleName,
            method: 'get',
            ...data.config,
          };
        }}
      />
    </Box>
  );
});

export default DataSourceView;
