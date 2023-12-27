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
  const evaluateContext = useSandboxQuery().window || {};
  const workspace = useWorkspace();
  const definedVariables = useMemo(() => {
    const map = new Map();
    traverseTreeData(modelVariables, (node) => {
      if (node.key.split('.').length > 1) {
        map.set(node.key, node);
      }
    });
    return map;
  }, [modelVariables]);

  const variables = evaluateContext['tango']?.stores
    ? [
        object2treeData(evaluateContext['tango']?.stores, 'stores', 0, 1, (keyPath, val) => {
          // FIXME: 需要调整下这个逻辑，运行时变量不支持删除和添加子节点
          if (keyPath.split('.').length === 2 && definedVariables.has(keyPath)) {
            return {
              showAddChildIcon: true,
              showRemoveIcon: true,
            };
          }
          if (isFunction(val)) {
            // 不可以同步给函数类型变量
            return {
              disabled: true,
              type: 'function',
            };
          }
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
            onUpdateVariable={(variableKey, code) => {
              workspace.updateStoreVariable(variableKey, code);
            }}
            onAddStore={(storeName) => {
              workspace.addStoreFile(storeName, newStoreTemplate);
            }}
            onRemoveVariable={(variableKey) => {
              const [, storeName, stateName] = variableKey.split('.');
              workspace.removeStoreState(storeName, stateName);
            }}
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
