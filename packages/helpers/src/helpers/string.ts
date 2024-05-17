/**
 * 转为驼峰 (lowerCamelCase)
 * @example foo -> foo
 * @example foo-bar -> fooBar
 * @param str
 * @returns
 */
export function camelCase(str: string) {
  str = str.charAt(0).toLowerCase() + str.slice(1);
  return str.replace(/\W+(.)/g, (match, chr) => {
    return chr.toUpperCase();
  });
}

/**
 * 将输入字符串转换为大驼峰格式(PascalCase)
 * @example about -> About
 * @example not-found -> NotFound
 * @param str
 */
export function upperCamelCase(str: string) {
  const text = camelCase(str.toLowerCase());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * 生成随机 uuid
 * @param prefix 前缀字符串
 * @returns
 */
export function uuid(prefix = 't', fractionDigits = 4) {
  return `${prefix}${Math.random().toFixed(fractionDigits).replace('0.', '')}`;
}

/**
 * 是否是合法的 url 地址
 * @example www.163.com
 * @example //www.163.com
 * @example https://www.163.com
 * @example http://www.163.com
 * @param url
 * @returns
 */
export function isValidUrl(url: string) {
  // 创建一个正则表达式
  const pattern = /^(https:)?(\/\/)?[^\s/$.?#].[^\s]*$/i;
  // 使用正则表达式测试 URL 是否匹配
  return pattern.test(url);
}

/**
 * 检查给定的路径是否含有后缀名
 * @param str 输入路径
 * @returns 如果有后缀返回 true，反之返回 false
 */
export function hasFileExtension(str: string) {
  // 如果点号的索引大于斜杠的索引，则说明路径包含后缀名
  return str.lastIndexOf('.') > str.lastIndexOf('/');
}

/**
 * 解析 dnd 追踪字符串
 * @deprecated 使用 parseDndId 代替
 *
 * @example Button:123 -> ["Button", "Button:123"]
 * @param str 字符串
 */
export function parseDndTrackId(str: string) {
  if (!str) {
    return [];
  }
  const parts = str.split(':');
  return [parts[0], str];
}

interface DndIdParsedType {
  /**
   * full id
   */
  id?: string;
  /**
   * 组件代码中的 id，一般对应组件的 tid 属性
   */
  codeId?: string;
  /**
   * 组件名
   */
  component?: string;
  /**
   * 文件名
   */
  filename?: string;
}

/**
 * 解析 dnd id
 * @example Button:button123 -> { component: "Button", id: "Button:123" }
 * @example LocalBlock:Button:123 -> { filename: LocalBlock, component: "Button", id: "Button:123" }
 * @param str
 */
export function parseDndId(str: string): DndIdParsedType {
  if (!str) {
    return {};
  }

  const parts = str.split(':');
  if (parts.length === 2) {
    // e.g. Button:button123
    return {
      id: str,
      component: parts[0],
      codeId: parts[1],
    };
  } else if (parts.length >= 3) {
    // e.g. LocalBlock:Button:button123
    const filename = decodeURIComponent(parts[0]);
    return {
      id: str,
      filename,
      component: parts[1],
      codeId: parts[2],
    };
  }
  return {
    id: str,
  };
}
