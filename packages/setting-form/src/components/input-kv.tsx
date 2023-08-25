import React, { useState, useRef, useEffect, memo } from 'react';
import { Input } from 'antd';
import { css } from 'styled-components';
import { Box } from 'coral-system';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { formatValue, compareValue } from './util';

const rowCss = css`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  .ant-input-affix-wrapper:first-child {
    margin-right: 12px;
  }

  .anticon-delete {
    margin-left: 8px;
    color: #666;

    &:hover {
      color: #1890ff;
    }
  }
`;

const btnCss = css`
  display: inline-block;
  cursor: pointer;
  color: #1890ff;
  max-width: 80px;
  line-height: 1;

  .btn-span {
    margin-left: 6px;
  }
`;

const tipCss = css`
  font-size: 12px;
  color: red;
  margin-bottom: 8px;
`;

const OneInputKV = (props: any) => {
  const {
    keyInputProps,
    valueInputProps,
    format = 'simple',
    onChange,
    defaultValue,
    value,
  } = props;
  const [data, setData] = useState<Array<any> | any>(
    formatValue({
      data: defaultValue || value,
      format: 'original',
    }),
  );
  const [validate, setValidate] = useState(false);
  const counter = useRef(0);

  useEffect(() => {
    const newData: any =
      format === 'simple' ? data : formatValue({ data: value, format: 'original' });
    // compare
    const flag = compareValue(data, newData);

    // 当 value 值为真，compare 后不等时
    value && !flag && setData(newData);
  }, [value]);

  // 点击添加的回调
  const handleAdd = () => {
    // 提前校验上一个是否有 key
    const last = data[data.length - 1];

    setValidate(true);

    if (data.length > 0 && !last.key) {
      return;
    }

    counter.current++;

    const newData = data.concat([{ index: counter.current }]);

    _updateData(newData);
  };

  // 点击删除的回调
  const handleDelete = (index: number, item: any) => {
    const newData = [...data];

    // delete
    newData.splice(index, 1);

    _updateData(newData);
    !newData.length && setValidate(false);
  };

  const handleInput = (name: string, index: number, value: string) => {
    const newData = [...data];

    if (!newData[index]) return;

    // 更新值
    newData[index][name] = value;

    _updateData(newData);
  };

  const _updateData = (values: Array<Record<string, string>>) => {
    const omit = ({ index, ...rest }: any) => rest;
    let value = formatValue({ data: values, format });

    Array.isArray(value) && (value = value.map((item) => omit(item)));

    setData(values);
    onChange?.(value);
  };

  // render
  const renderRow = () =>
    data?.map((item: any, index: number) => (
      <>
        <Box key={item.index} css={rowCss}>
          <Input
            allowClear
            placeholder="请输入 Key"
            {...keyInputProps}
            value={item.key}
            onChange={(ev) => {
              handleInput('key', index, ev.target?.value);
            }}
          />
          <Input
            allowClear
            placeholder="请输入 Value"
            {...valueInputProps}
            value={item.value}
            onChange={(ev) => {
              handleInput('value', index, ev.target.value);
            }}
          />
          <DeleteOutlined
            onClick={() => {
              handleDelete(index, item);
            }}
          />
        </Box>
        {!item.key && validate && <Box css={tipCss}>提示：请先输入 key </Box>}
      </>
    ));

  const rows = renderRow();

  return (
    <Box>
      {rows}
      <Box onClick={handleAdd} css={btnCss}>
        <PlusOutlined /> 添加键值
      </Box>
    </Box>
  );
};

export const InputKV = memo(OneInputKV, (prev, next) => prev.value === next.value);
