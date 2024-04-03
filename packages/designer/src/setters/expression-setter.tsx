import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, css } from 'coral-system';
import { Dropdown, Modal } from 'antd';
import {
  isValidExpressionCode,
  isWrappedByExpressionContainer,
  value2expressionCode,
} from '@music163/tango-core';
import {
  getVariableContent,
  noop,
  useBoolean,
  getValue,
  IVariableTreeNode,
} from '@music163/tango-helpers';
import {
  CloseCircleFilled,
  ExpandAltOutlined,
  InfoOutlined,
  KeyOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Panel, InputCode, Action, CodeOutlined } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { VariableTree } from '../components';
import { useSandboxQuery } from '../context';
import { CODE_TEMPLATES } from '../helpers';
import { shapeServiceValues } from '../sidebar/datasource-panel/interface-config';

export const expressionValueValidate = (value: string) => {
  if (isWrappedByExpressionContainer(value)) {
    const exp = getVariableContent(value);
    if (!isValidExpressionCode(exp)) {
      return '表达式存在语法错误！';
    }
  }
};

export const jsonValueValidate = (value: string) => {
  if (isWrappedByExpressionContainer(value)) {
    const jsonStr = getVariableContent(value);
    try {
      JSON.parse(jsonStr);
    } catch (e) {
      return '不是合法的 JSON 语法！';
    }
  }
};

/**
 * 返回 `{}` 包裹后的表达式代码
 * @param code 原始代码
 * @returns
 */
export function getWrappedExpressionCode(code: string) {
  let ret;
  if (!code) {
    // do nothing
  } else if (isWrappedByExpressionContainer(code)) {
    ret = code;
  } else {
    ret = `{${code}}`;
  }
  return ret;
}

const suffixStyle = css`
  display: flex;
  align-items: center;
  .anticon-close-circle {
    color: rgba(0, 0, 0, 0.25);
    &:hover {
      color: rgba(0, 0, 0, 0.45);
    }
  }
`;

export interface ExpressionSetterProps extends FormItemComponentProps<string> {
  modalTitle?: string;
  modalTip?: string;
  autoCompleteOptions?: string[];
  allowClear?: boolean;
  showOptionsDropDown?: boolean;
}

export function ExpressionSetter(props: ExpressionSetterProps) {
  const {
    onChange,
    modalTitle,
    modalTip,
    autoCompleteOptions,
    placeholder = '输入JS代码',
    value: valueProp,
    status,
    allowClear = true,
    newStoreTemplate,
    showOptionsDropDown = true,
  } = props;
  const [visible, { on, off }] = useBoolean();
  const [inputValue, setInputValue] = useState(() => {
    return value2expressionCode(valueProp);
  });
  const sandbox = useSandboxQuery();
  const evaluateContext = sandbox.window;

  // when receive new value, sync state
  useEffect(() => {
    setInputValue(value2expressionCode(valueProp));
  }, [valueProp]);

  const change = useCallback(
    (code: string) => {
      if (code === valueProp) {
        return;
      }

      const ret = getWrappedExpressionCode(code);

      if (ret === valueProp) {
        return;
      }

      onChange(ret);
    },
    [valueProp, onChange],
  );

  return (
    <Box className="ExpressionSetter">
      {/* 同时支持下拉框展示 */}
      <InputCode
        placeholder={placeholder}
        suffix={
          <Box css={suffixStyle}>
            {allowClear && (
              <CloseCircleFilled
                title="清空"
                onClick={() => {
                  change('');
                }}
              />
            )}
            {showOptionsDropDown && autoCompleteOptions?.length && (
              <Dropdown
                menu={{
                  items: autoCompleteOptions.map((option) => ({
                    key: option,
                    label: (
                      <Text
                        onClick={() => {
                          change(option);
                        }}
                      >
                        {option}
                      </Text>
                    ),
                  })),
                }}
              >
                <Action tooltip="使用预设代码片段" icon={<MenuOutlined />} size="small" />
              </Dropdown>
            )}
            <Action
              tooltip="打开表达式变量选择面板"
              icon={<ExpandAltOutlined />}
              onClick={on}
              size="small"
            />
          </Box>
        }
        value={inputValue}
        onChange={setInputValue}
        onBlur={() => {
          change(inputValue);
        }}
        autoCompleteContext={evaluateContext}
        autoCompleteOptions={autoCompleteOptions}
        status={status}
        maxHeight="200px"
      />
      <ExpressionModal
        title={modalTitle}
        subTitle={modalTip}
        placeholder={placeholder}
        autoCompleteOptions={autoCompleteOptions}
        newStoreTemplate={newStoreTemplate}
        visible={visible}
        value={inputValue}
        onCancel={() => off()}
        onOk={(value) => {
          change(value);
          off();
        }}
      />
    </Box>
  );
}

export interface ExpressionModalProps {
  title?: string;
  subTitle?: string;
  placeholder?: string;
  visible?: boolean;
  defaultValue?: string;
  value?: string;
  onCancel?: () => void;
  onOk?: (value: string) => void;
  dataSource?: IVariableTreeNode[];
  autoCompleteOptions?: string[];
  /**
   * 新建 store 的模板代码
   */
  newStoreTemplate?: string;
}

export function ExpressionModal({
  title,
  subTitle,
  placeholder,
  visible,
  onCancel = noop,
  onOk = noop,
  defaultValue,
  value,
  dataSource,
  autoCompleteOptions,
  newStoreTemplate = CODE_TEMPLATES.newStoreTemplate,
}: ExpressionModalProps) {
  const [exp, setExp] = useState(value ?? defaultValue);
  const [error, setError] = useState('');
  const workspace = useWorkspace();

  const { expressionVariables } = useWorkspaceData();
  const serviceModules = Object.keys(workspace.serviceModules).map((key) => ({
    label: key === 'index' ? '默认模块' : key,
    value: key,
  }));

  const sandbox = useSandboxQuery();
  const evaluateContext = sandbox.window;

  const handleExpInputChange = (val: string) => {
    setExp(val?.trim());
  };

  useEffect(() => {
    setExp(value);
  }, [value]);

  return (
    <Modal
      closable={false}
      destroyOnClose
      width="60%"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        onOk(exp);
      }}
      bodyStyle={{
        padding: 0,
      }}
    >
      <Panel title={`将 ${title} 设置为引用变量或自定义表达式`} subTitle={subTitle} shape="solid">
        <InputCode
          shape="inset"
          minHeight="56px"
          maxHeight="200px"
          value={exp}
          placeholder={placeholder}
          onChange={handleExpInputChange}
          onBlur={() => {
            setError(expressionValueValidate(exp));
          }}
          autoCompleteContext={evaluateContext}
          autoCompleteOptions={autoCompleteOptions}
        />
        {error ? <Text color="red">输入的表达式存在语法错误，请修改后再提交！</Text> : null}
      </Panel>
      <Panel
        title="从变量列表中选中"
        shape="solid"
        borderTop="0"
        overflow="hidden"
        bodyProps={{ overflow: 'hidden' }}
      >
        <VariableTree
          height={380}
          showViewButton
          dataSource={dataSource || expressionVariables}
          appContext={sandbox?.window['tango']}
          getStoreNames={() => Object.keys(workspace.storeModules)}
          serviceModules={serviceModules}
          getServiceData={(serviceKey) => {
            const data = workspace.getServiceFunction(serviceKey);
            return {
              name: data.name,
              moduleName: data.moduleName,
              method: 'get',
              ...data.config,
            };
          }}
          onSelect={(node) => {
            if (!node.key) {
              return;
            }
            if (node.key.split('.').length < 2) {
              return;
            }
            let str;
            if (/^(stores|services)\./.test(node.key)) {
              str = `{tango.${node.key.replaceAll('.', '?.')}}`;
            } else {
              str = `{${node.key}}`;
            }
            setExp(str);
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
          onRemoveStoreVariable={(variableKey) => {
            workspace.removeStoreVariable(variableKey);
          }}
          onRemoveService={(serviceKey) => {
            workspace.removeServiceFunction(serviceKey);
          }}
          onAddService={(data) => {
            const { name, moduleName, ...payload } = shapeServiceValues(data);
            workspace.addServiceFunction(name, payload, moduleName);
          }}
          onUpdateService={(data) => {
            const { name, moduleName, ...payload } = shapeServiceValues(data);
            workspace.updateServiceFunction(name, payload, moduleName);
          }}
          getPreviewValue={(node) => {
            if (!node || !node.key) {
              return;
            }

            if (node.type === 'function') {
              return;
            }

            return getValue(evaluateContext['tango'], node.key);
          }}
        />
      </Panel>
    </Modal>
  );
}
