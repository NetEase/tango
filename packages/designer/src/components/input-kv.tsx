import React, { useState, useRef, useEffect, memo } from 'react';
import { Input } from 'antd';
import { css, Box } from 'coral-system';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ExpressionSetter } from '../setters/expression-setter';

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

const SCENE_COMPONENTS = {
  default: ['input', 'input'],
  params: ['input', 'expression'],
};

const InputComponent = ({ component, ...props }: any) => {
  switch (component) {
    case 'expression':
      return (
        <Box overflowX="auto" minWidth="45%">
          <ExpressionSetter {...props} placeholder="请选择或输入Value" />
        </Box>
      );
    default:
      return (
        <Input
          style={{ minWidth: '45%' }}
          allowClear
          {...props}
          onChange={(ev) => {
            props.onChange(ev.target?.value);
          }}
        />
      );
  }
};

const OneInputKV = (props: any) => {
  const {
    scene = 'default', // dafault｜params
    keyInputProps,
    valueInputProps,
    format = 'simple',
    onChange,
    defaultValue,
    value,
  } = props;
  const [data, setData] = useState<any[] | any>(
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

  const handleInput = (name: string, index: number, val: string) => {
    const newData = [...data];

    if (!newData[index]) return;

    // 更新值
    newData[index][name] = val;

    _updateData(newData);
  };

  const _updateData = (values: Array<Record<string, string>>) => {
    const omit = ({ index, ...rest }: any) => rest;
    let nextValue = formatValue({ data: values, format });

    Array.isArray(nextValue) && (nextValue = nextValue.map((item) => omit(item)));

    setData(values);
    onChange?.(nextValue);
  };

  // render
  const renderRow = () =>
    data?.map((item: any, index: number) => (
      <>
        <Box key={item.index} css={rowCss}>
          <InputComponent
            component={SCENE_COMPONENTS[scene][0]}
            placeholder="请输入Key"
            {...keyInputProps}
            value={item.key}
            onChange={(val: any) => {
              handleInput('key', index, val);
            }}
          />
          <InputComponent
            component={SCENE_COMPONENTS[scene][1]}
            placeholder="请输入Value"
            {...valueInputProps}
            value={item.value}
            onChange={(val: any) => {
              handleInput('value', index, val);
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

interface IFormatValueConfig {
  format: 'simple' | 'original';
  data?: Record<string, string> | Array<Record<string, string>>;
}

const formatData = (data?: Array<Record<string, string>>) => {
  const result: Record<string, string> = {};

  // 遍历数据
  data?.forEach((item) => {
    item.key && !(item.key in result) && (result[item.key] = item.value);
  });

  return result;
};

// 格式化value
const formatValue = ({ format, data }: IFormatValueConfig) => {
  if (format === 'original') {
    if (!data) return [{ index: 0 }];

    const list = Array.isArray(data)
      ? data
      : Object.keys(data).map((key) => ({ key, value: data[key] }));

    return list.map((item, idx) => ({ ...item, index: idx - list.length - 1 }));
  } else {
    if (!data) return {};

    return Array.isArray(data) ? formatData(data) : data;
  }
};

const compareValue = (origin: any[], data: any[]) => {
  const resolve = (list: any[]) => {
    let keyStr = '';
    let valueStr = '';

    list.forEach((item) => {
      const { key, value } = item;

      keyStr += key || '$';
      valueStr += value || '$';
    });

    return { keyStr, valueStr };
  };

  const oldRes = resolve(origin);
  const newRes = resolve(data);

  return oldRes.keyStr === newRes.keyStr && oldRes.valueStr === newRes.valueStr;
};
