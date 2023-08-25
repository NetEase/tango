interface FormatProps {
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
export const formatValue = ({ format, data }: FormatProps) => {
  if (format === 'original') {
    if (!data) return [{ index: 0 }];

    const list = Array.isArray(data) ? data : Object.keys(data).map((key) => ({ key, value: data[key] }));

    return list.map((item, idx) => ({ ...item, index: idx - list.length - 1 }));
  } else {
    if (!data) return {};

    return Array.isArray(data) ? formatData(data) : data;
  }
};

export const compareValue = (origin: Array<any>, data: Array<any>) => {
  const resolve = (list: Array<any>) => {
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
