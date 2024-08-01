import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from 'coral-system';
import { Input, Tooltip } from 'antd';
import { getValue, isFunction } from '@music163/tango-helpers';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { MenuOutlined } from '@ant-design/icons';
import { useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { VariableTreeModal } from '../components';
import { useSandboxQuery } from '../context';
import { CODE_TEMPLATES } from '../helpers';

function object2treeData(
  val: any,
  keyPath: string,
  currentDepth = 0,
  maxDepth = 999,
  getProps?: (keyPath: string, val: any) => object,
) {
  const title = keyPath.split('.').slice(-1)[0];
  const rest = getProps?.(keyPath, val);

  if (typeof val !== 'object' || currentDepth > maxDepth) {
    return {
      title,
      key: keyPath,
      ...rest,
    };
  }

  return {
    title,
    key: keyPath,
    selectable: false,
    children: Object.keys(val).reduce((acc, key) => {
      acc.push(
        object2treeData(val[key], `${keyPath}.${key}`, currentDepth + 1, maxDepth, getProps),
      );
      return acc;
    }, []),
    ...rest,
  };
}

function traverseTreeData(val: any, callback: (val: any) => void) {
  if (Array.isArray(val)) {
    val.forEach((child: any) => traverseTreeData(child, callback));
  } else {
    callback(val);
  }

  if ('children' in val) {
    traverseTreeData(val.children, callback);
  }
}

export function ModelSetter({
  value,
  onChange,
  newStoreTemplate = CODE_TEMPLATES.newStoreTemplate,
}: FormItemComponentProps) {
  const [inputValue, setInputValue] = useState(value);
  const { modelVariables } = useWorkspaceData();
  const evaluateContext: any = useSandboxQuery().window || {};
  const workspace = useWorkspace();
  const definedVariables = useMemo(() => {
    const list: string[] = [];
    traverseTreeData(modelVariables, (node) => {
      if (node.key.split('.').length > 1) {
        list.push(node.key);
      }
    });
    return list;
  }, [modelVariables]);

  const variables = evaluateContext['tango']?.stores
    ? [
        object2treeData(evaluateContext['tango']?.stores, 'stores', 0, 1, (keyPath, val) => {
          const ret: any = {};
          if (isFunction(val)) {
            ret.disabled = true;
            ret.type = 'function';
          }

          if (!definedVariables.includes(keyPath)) {
            ret.showAddButton = false;
            ret.showRemoveButton = false;
          } else if (/^stores\.[a-zA-Z0-9]+$/.test(keyPath)) {
            ret.showAddButton = true;
          }

          return ret;
        }),
      ]
    : modelVariables;

  useEffect(() => {
    // 同步受控值的变化
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const onInputChange = useCallback((e: any) => {
    setInputValue(e.target?.value);
  }, []);

  const onInputBlur = useCallback(
    (e: any) => {
      const next = e.target?.value;
      onChange(next || undefined);
    },
    [onChange],
  );

  return (
    <Box>
      <Input
        value={inputValue}
        placeholder="将结果同步到的变量，例如storeName.varName"
        allowClear
        autoFocus={false}
        onChange={onInputChange}
        onBlur={onInputBlur}
        suffix={
          <VariableTreeModal
            title="同步到的变量"
            trigger={
              <Tooltip title="从模型列表选择" placement="topRight">
                <MenuOutlined />
              </Tooltip>
            }
            dataSource={variables as any[]}
            onSelect={(node) => {
              const modelPath = node.key.split('.').slice(1).join('.');
              onChange(modelPath);
            }}
            onAddStoreVariable={(storeName, data) => {
              workspace.addStoreState(storeName, data.name, data.initialValue);
            }}
            onUpdateStoreVariable={(variableKey, code) => {
              workspace.updateStoreVariable(variableKey, code);
            }}
            onAddStore={(storeName) => {
              workspace.addStoreFile(storeName, newStoreTemplate);
            }}
            onRemoveStoreVariable={(variablePath) => {
              workspace.removeStoreVariable(variablePath);
            }}
            onRemoveService={(serviceKey) => {
              workspace.removeServiceFunction(serviceKey);
            }}
            getStoreNames={() => Object.keys(workspace.storeModules)}
            getPreviewValue={(node) => {
              if (!node || !node.key) {
                return;
              }
              return getValue(evaluateContext['tango'], node.key);
            }}
          />
        }
      />
    </Box>
  );
}
