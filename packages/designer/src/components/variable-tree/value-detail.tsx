import React, { useState } from 'react';
import { isNil, noop, useBoolean } from '@music163/tango-helpers';
import { Empty, Space, Button, Radio, Alert } from 'antd';
import { Box } from 'coral-system';
import { InputCode, Panel } from '@music163/tango-ui';
import { isValidExpressionCode } from '@music163/tango-core';
import { IVariableTreeNode } from '../../types';

const previewOptions = [
  { label: '运行时', value: 'runtime' },
  { label: '定义', value: 'define' },
];

export type ValueDetailModeType = 'runtime' | 'define';

export interface ValueDetailProps {
  defaultMode?: ValueDetailModeType;
  children: (mode: ValueDetailModeType) => React.ReactNode;
}

export function ValueDetail({ defaultMode = 'runtime', children }: ValueDetailProps) {
  const [mode, setMode] = useState<ValueDetailModeType>(defaultMode);
  return (
    <Panel
      title="变量详情"
      shape="solid"
      extra={
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          size="small"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
          }}
          options={previewOptions}
        />
      }
    >
      {children(mode)}
    </Panel>
  );
}

export interface ValueDefineProps {
  data: IVariableTreeNode;
  onSave?: (variableKey: string, code: string) => void;
}

/**
 * 变量值定义面板
 */
export function ValueDefine({ data, onSave = noop }: ValueDefineProps) {
  const [value, setValue] = useState(data.raw);
  const [error, setError] = useState('');
  const [editable, { on, off }] = useBoolean();
  if (isNil(data.raw)) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="缺失定义数据" />;
  }
  return (
    <Box>
      <InputCode
        shape="inset"
        value={value}
        onChange={(nextValue) => setValue(nextValue)}
        readOnly={!editable}
        onBlur={() => {
          if (!value) {
            setError('输入内容不可为空！');
          } else if (value && !isValidExpressionCode(`foo = ${value}`)) {
            // 这里先保证输入是一个合法的表达式
            setError('代码格式错误，请检查代码语法！');
          } else {
            setError('');
          }
        }}
      />
      <Box color="red" my="m">
        {error}
      </Box>
      <Box mt="l">
        {editable ? (
          <Space>
            <Button
              onClick={() => {
                off();
                setError('');
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (error) {
                  return;
                }

                onSave(data.key, value);
                off();
              }}
            >
              保存
            </Button>
          </Space>
        ) : (
          <Button onClick={on}>编辑</Button>
        )}
      </Box>
    </Box>
  );
}

export interface NodeCommonDetailProps {
  data: IVariableTreeNode;
}

export function NodeCommonDetail({ data }: NodeCommonDetailProps) {
  if (!data?.help) {
    return <div />;
  }
  return <Alert type="info" message={`使用说明：${data.help}`} closable />;
}
