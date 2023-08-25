/**
 * 对数组进行去重，适用于简单数组，对象为根据引用进行去重
 * @param arr 输入数组
 * @returns 去重后的数组
 */
export function uniq(arr: any[]) {
  const set = new Set(arr);
  return Array.from(set);
}

/**
 * 对象数组转为对象
 * @example [{ a: 'a' }, { b: 'b' }] -> { a: 'a', b: 'b' }
 * @param arr
 * @param getKey
 * @param getValue
 * @returns
 */
export function array2object(
  arr: Array<Record<string, any>>,
  getKey: (item: any) => any,
  getValue?: (item: any) => any,
) {
  return arr.reduce((prev, cur) => {
    if (cur) {
      const key = getKey(cur);
      prev[key] = getValue ? getValue(cur) : cur;
    }
    return prev;
  }, {});
}

/**
 * 树形嵌套数据的过滤
 * @param array 输入的数组
 * @param predict 断言函数，过滤出符合判断函数的数据
 * @param childrenProp 子属性的名字
 * @param onlyLeaf 是否子探测叶子结点，即存在子节点的父节点不执行断言函数
 */
export function filterTreeData<T = unknown>(
  array: T[],
  predict: (leaf: T) => boolean,
  childrenProp = 'children',
  onlyLeaf = false,
) {
  const reducer = (result: T[], current: T) => {
    if (current[childrenProp]) {
      const newChildren = current[childrenProp].reduce(reducer, []);
      if (newChildren.length) {
        result.push({
          ...current,
          [childrenProp]: newChildren,
        });
        if (!onlyLeaf) return result;
      }
      if (onlyLeaf) return result;
    }
    if (predict(current)) {
      result.push(current);
    }

    return result;
  };

  return array.reduce(reducer, []);
}

export function mapTreeData<T = unknown>(
  treeData: T[],
  mapper: (node: T) => any,
  childrenProp = 'children',
) {
  return treeData.map((node) => {
    const newNode = mapper(node);
    if (node[childrenProp]) {
      newNode[childrenProp] = mapTreeData(node[childrenProp], mapper, childrenProp);
    }
    return newNode;
  });
}
