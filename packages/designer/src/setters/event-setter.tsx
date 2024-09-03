import React, { useCallback, useMemo, useState } from 'react';
import { css, Box, Text } from 'coral-system';
import { AutoComplete, Input } from 'antd';
import { ActionSelect } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { Dict, wrapCode } from '@music163/tango-helpers';
import { ExpressionPopover, getCallbackValue } from './code-setter';
import { value2code } from '@music163/tango-core';

enum EventAction {
  NoAction = 'noAction',
  ConsoleLog = 'consoleLog',
  BindExpression = 'bindExpression',
  OpenModal = 'openModal',
  CloseModal = 'closeModal',
  NavigateTo = 'navigateTo',
}

const wrapperStyle = css`
  .ant-select,
  .ant-input {
    width: 100%;
    margin-bottom: 8px;
  }
`;

export type EventSetterProps = FormItemComponentProps<string>;

/**
 * 事件监听函数绑定器
 */
export function EventSetter(props: EventSetterProps) {
  const { value, onChange, modalTitle, modalTip, template } = props;
  const [type, setType] = useState<EventAction>(); // 事件类型
  const [temp, setTemp] = useState(''); // 二级暂存值
  const { actionVariables, routeOptions } = useWorkspaceData();
  const workspace = useWorkspace();
  const modalOptions = workspace.activeViewModule.listModals() || [];

  const code = value2code(value);

  const handleChange = useCallback<FormItemComponentProps['onChange']>(
    (nextValue: any, ...args) => {
      if (!nextValue) {
        onChange(undefined);
      }
      if (nextValue !== code) {
        onChange(wrapCode(nextValue), ...args);
      }
    },
    [onChange, code],
  );
  const options = useMemo(
    () => [
      { label: '无动作', value: EventAction.NoAction },
      { label: '打印事件', value: EventAction.ConsoleLog },
      {
        label: (
          <ExpressionPopover
            title={modalTitle}
            subTitle={modalTip}
            value={value}
            template={template}
            onOk={(nextValue) => {
              handleChange(nextValue);
            }}
            dataSource={actionVariables}
          >
            <Text>绑定 JS 表达式</Text>
          </ExpressionPopover>
        ),
        value: EventAction.BindExpression,
      },
      { label: '打开页面', value: EventAction.NavigateTo },
      { label: '打开弹窗', value: EventAction.OpenModal },
      { label: '关闭弹窗', value: EventAction.CloseModal },
    ],
    [modalTitle, value, actionVariables, template, handleChange],
  );

  const onAction = (key: string) => {
    setType(key as EventAction); // 记录事件类型
    setTemp(''); // 重置二级选项值

    if (key === EventAction.NoAction) {
      handleChange(undefined);
      return;
    }
  };

  return (
    <Box css={wrapperStyle}>
      <ActionSelect options={options} onSelect={onAction} defaultText="请选择动作类型" />
      {type === EventAction.ConsoleLog && (
        <Input
          placeholder="输入 Console.log 日志内容"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onBlur={() => {
            if (temp) {
              handleChange(getExpressionValue(type, temp));
            }
          }}
        />
      )}
      {type === EventAction.NavigateTo && (
        <AutoComplete
          placeholder="选择或输入页面路由"
          options={routeOptions}
          value={temp}
          onChange={setTemp}
          onBlur={() => {
            if (temp) {
              handleChange(getExpressionValue(type, temp));
            }
          }}
        />
      )}
      {type === EventAction.OpenModal && (
        <AutoComplete
          placeholder="选择或输入弹窗 id"
          options={modalOptions}
          value={temp}
          onChange={setTemp}
          onBlur={() => {
            if (temp) {
              handleChange(getExpressionValue(type, temp));
            }
          }}
        />
      )}
      {type === EventAction.CloseModal && (
        <AutoComplete
          placeholder="选择或输入弹窗 id"
          options={modalOptions}
          value={temp}
          onChange={setTemp}
          onBlur={() => {
            if (temp) {
              handleChange(getExpressionValue(type, temp));
            }
          }}
        />
      )}
    </Box>
  );
}

const handlerMap: Dict = {
  [EventAction.ConsoleLog]: 'console.log',
  [EventAction.OpenModal]: 'tango.openModal',
  [EventAction.CloseModal]: 'tango.closeModal',
  [EventAction.NavigateTo]: 'tango.navigateTo',
};

function getExpressionValue(type: EventAction, value = '') {
  const handler = handlerMap[type];
  if (handler) {
    return getCallbackValue(`${handler}("${value}");`);
  }
}
