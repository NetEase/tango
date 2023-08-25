import { TangoViewNodeDataType } from '../types';

/**
 * 合并变量数组
 * @param list
 * @returns
 */
export function mergeVariableArray(...list: any[]) {
  const ret: any[] = [];
  for (const sub of list) {
    if (Array.isArray(sub)) {
      sub.forEach((item: any) => {
        if (item && item.children && item.children.length) {
          ret.push(item);
        }
      });
    }
  }
  return ret;
}

/**
 * 将输入值转换为 tree data 嵌套数组
 * @param list
 */
export function toTreeData(list: TangoViewNodeDataType[]) {
  const map: Record<string, TangoViewNodeDataType> = {};

  list.forEach((item) => {
    // 如果不存在，则初始化
    if (!map[item.id]) {
      map[item.id] = {
        ...item,
        children: [],
      };
    }

    // 是否找到父节点，找到则塞进去
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    }
  });

  // 保留根节点
  const ret = Object.values(map).filter((item) => !item.parentId);
  return ret;
}
