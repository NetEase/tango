import React, { useCallback, useMemo, useState } from 'react';
import { css, Box, Text } from 'coral-system';
import { AutoComplete } from 'antd';
import { ActionSelect } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { useWorkspace, useWorkspaceData } from '@music163/tango-context';
import { wrapCode } from '@music163/tango-helpers';
import { ExpressionPopover } from './expression-setter';
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
  const { value, onChange, modalTitle } = props;
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
            value={value}
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
    [modalTitle, value, actionVariables, handleChange],
  );

  const onAction = (key: string) => {
    setType(key as EventAction); // 记录事件类型
    setTemp(''); // 重置二级选项值

    switch (key) {
      case EventAction.ConsoleLog:
        handleChange('(...args) => console.log(...args)');
        break;
      case EventAction.NoAction:
        handleChange(undefined);
        break;
      default:
        break;
    }
  };

  const actionText = getActionText(type, temp, code);

  return (
    <Box css={wrapperStyle}>
      <ActionSelect options={options} onSelect={onAction} text={actionText} />
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

const handlerMap = {
  [EventAction.OpenModal]: 'openModal',
  [EventAction.CloseModal]: 'closeModal',
  [EventAction.NavigateTo]: 'navigateTo',
};

function getActionText(type: EventAction, temp: string, fallbackCode: string) {
  let text;
  if (handlerMap[type]) {
    text = getExpressionValue(type, temp);
  } else if (fallbackCode) {
    text = fallbackCode;
  }
  text = text || '请选择';
  return text;
}

function getExpressionValue(type: EventAction, value = '') {
  const handler = handlerMap[type];
  if (handler) {
    return `() => tango.${handler}("${value}")`;
  }
}
