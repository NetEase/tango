import React, { useState, useEffect } from 'react';
import { Box, css } from 'coral-system';
import { Alert, Modal, Tabs } from 'antd';
import { value2code, isValidExpressionCode } from '@music163/tango-core';
import {
  isVariableString,
  getVariableContent,
  noop,
  useBoolean,
  getValue,
} from '@music163/tango-helpers';
import { CloseCircleFilled, ExpandAltOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { IconButton, Panel, InputCode, ChatInput } from '@music163/tango-ui';
import { FormItemComponentProps } from '../form-item';
import { EditableVariableTree, VariableTreeNodeType } from '../components';
import { useFormVariable } from '../context';

export const expressionValueValidate = (value: string) => {
  if (isVariableString(value)) {
    const exp = getVariableContent(value);
    if (!isValidExpressionCode(exp)) {
      return '表达式存在语法错误！';
    }
  }
};

export const jsonValueValidate = (value: string) => {
  if (isVariableString(value)) {
    const jsonStr = getVariableContent(value);
    try {
      JSON.parse(jsonStr);
    } catch (e) {
      return '不是合法的 JSON 语法！';
    }
  }
};

// FIXME: 这里应该用原始的代码 raw value
export const getInputValue = (val: any) => {
  if (!val) return '';

  let ret;

  switch (typeof val) {
    case 'string':
      ret = val;
      break;
    case 'number':
      ret = String(val);
      break;
    case 'object':
      ret = value2code(val);
      ret = `{${ret}}`;
      break;
    default:
      ret = '';
      break;
  }

  return ret;
};

const suffixStyle = css`
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
}

export function ExpressionSetter(props: ExpressionSetterProps) {
  const {
    onChange,
    modalTitle,
    modalTip,
    autoCompleteOptions,
    placeholder = '表达式请使用 {} 包裹',
    value: valueProp,
    status,
    allowClear = true,
  } = props;
  const [visible, { on, off }] = useBoolean();
  const [inputValue, setInputValue] = useState(() => {
    return getInputValue(valueProp);
  });
  const { evaluateContext } = useFormVariable();

  // when receive new value, sync state
  useEffect(() => {
    setInputValue(getInputValue(valueProp));
  }, [valueProp]);

  const change = (code: string) => {
    if (!code) {
      code = undefined;
    }

    if (code !== valueProp) {
      onChange(code);
    }
  };

  return (
    <Box className="ExpressionSetter">
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
            <IconButton tooltip="打开表达式变量选择面板" icon={<ExpandAltOutlined />} onClick={on} />
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
        visible={visible}
        defaultValue={inputValue}
        onCancel={() => off()}
        onOk={(value) => {
          onChange(value);
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
  onCancel?: () => void;
  onOk?: (value: string) => void;
  dataSource?: VariableTreeNodeType[];
  autoCompleteOptions?: string[];
}

export function ExpressionModal({
  title,
  subTitle,
  placeholder,
  visible,
  onCancel = noop,
  onOk = noop,
  defaultValue,
  dataSource,
  autoCompleteOptions,
}: ExpressionModalProps) {
  const [exp, setExp] = useState(defaultValue);
  const { expressionVariables, evaluateContext, onAction, remoteServices } = useFormVariable();
  const gptService = remoteServices?.GptService;
  const handleExpInputChange = (val: string) => {
    setExp(val?.trim());
  };
  return (
    <Modal
      title={title}
      width="70%"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        onOk(exp);
      }}
      destroyOnClose
    >
      <Panel
        title="绑定的表达式"
        subTitle={subTitle}
        extra={
          <IconButton
            icon={<QuestionCircleOutlined />}
            tooltip="你可以直接编辑下面的表达式，表达式需要使用 { } 进行包裹，点击此图标可以查看详细文档。"
            href="https://music-doc.st.netease.com/st/tango-docs/docs/guide/javascript/overview"
          />
        }
        shape="solid"
        borderRadius="m"
      >
        <InputCode
          shape="inset"
          minHeight="56px"
          maxHeight="200px"
          value={exp}
          placeholder={placeholder}
          onChange={handleExpInputChange}
          autoCompleteContext={evaluateContext}
          autoCompleteOptions={autoCompleteOptions}
        />
      </Panel>
      <Box mt="m" maxHeight={400} overflow="auto">
        <Tabs type="card" size="small">
          <Tabs.TabPane key="list" tab="从变量列表中选择">
            <Box my="m">
              <Alert
                type="info"
                message="你可以直接从下方的列表中选择已定义的变量"
                banner
                closable
              />
            </Box>
            <EditableVariableTree
              // height={400}
              dataSource={dataSource || expressionVariables}
              onUse={(node) => {
                let str;
                if (/^(stores|services)\./.test(node.key)) {
                  str = `{tango.${node.key.replaceAll('.', '?.')}}`;
                } else {
                  str = `{${node.key}}`;
                }
                setExp(str);
              }}
              onAddVariable={(storeName, data) => {
                onAction('addStoreState', [storeName, data.name, data.initialValue]);
              }}
              onDeleteVariable={(storeName, stateName) => {
                onAction('removeStoreState', [storeName, stateName]);
              }}
              onDeleteStore={(storeName) => {
                onAction('removeStoreModule', [storeName]);
              }}
              onSave={(code, node) => {
                onAction('updateModuleCodeByVariablePath', [node.key, code]);
              }}
              getPreviewValue={(node) => {
                if (!node || !node.key) {
                  return;
                }

                if (node.type === 'function') {
                  return node.raw;
                }

                return getValue(evaluateContext['tango'], node.key);
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="ai" tab="使用 AI 助手生成" disabled={!gptService?.textCompletion}>
            <ChatInput
              placeholder="例如：实现一个函数，从给定的数组中过滤出name为bob的数据"
              onGenerate={(text) =>
                gptService
                  .textCompletion({
                    prompt: getExpressionCode(text),
                    model: 'gpt-3.5-turbo',
                    temperature: 0.5,
                    topP: 1,
                    presencePenalty: 0,
                    frequencyPenalty: 0,
                    mode: 'chat',
                  })
                  .then((res) => {
                    return res?.detail?.choices?.[0]?.text;
                  })
              }
              onApply={(preview) => {
                setExp(`{${preview}}`);
              }}
              showCloseIcon={false}
            />
          </Tabs.TabPane>
        </Tabs>
      </Box>
    </Modal>
  );
}

function getExpressionCode(userInput: string) {
  return `你是一个代码生成助手。你使用的编程语言是 JavaScript。不要解释代码，只返回代码块本身，代码必须包裹在 {} 内部。
标准的输出格式如下：
1. {this.a}
2. {() => {}}
3. {tango.stores.user.name}

${userInput}
  `;
}
