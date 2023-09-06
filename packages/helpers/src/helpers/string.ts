/**
 * 转为驼峰 (lowerCamelCase)
 * @example foo -> foo
 * @example foo-bar -> fooBar
 * @param str
 * @returns
 */
export function camelCase(str: string) {
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

type DndIdParsedType = {
  /**
   * 完整的 ID
   */
  id?: string;
  /**
   * 组件名
   */
  component?: string;
  /**
   * 文件名
   */
  filename?: string;
  /**
   * @deprecated 使用 filename 代替
   */
  module?: string;
  /**
   * 序号
   */
  index?: string;
};

/**
 * 解析 dnd id
 * @example Button:123 -> { component: "Button", id: "Button:123" }
 * @example LocalBlock:Button:123 -> { filename: LocalBlock, component: "Button", id: "Button:123" }
 * @param str
 */
export function parseDndId(str: string): DndIdParsedType {
  if (!str) {
    return {};
  }

  const parts = str.split(':');
  if (parts.length === 2) {
    return {
      component: parts[0],
      index: parts[1],
      id: str,
    };
  } else if (parts.length >= 3) {
    const filename = decodeURIComponent(parts[0]);
    return {
      module: filename,
      filename,
      component: parts[1],
      index: parts[2],
      id: str,
    };
  }
  return {
    id: str,
  };
}

/**
 * 给定字符串是否是合法的 JSON 字符串
 * @param str
 */
export function isJSONString(str: string) {
  if (!str) {
    return false;
  }

  let json;
  try {
    json = JSON.parse(str);
    return typeof json === 'object';
  } catch (err) {
    return false;
  }
}

/**
 * 给定代码是否是有效的函数代码
 * @param str
 */
export function isValidFunctionCode(str: string) {
  try {
    // eslint-disable-next-line no-eval
    const ret = eval(`typeof (${str})`);
    return ret === 'function';
  } catch (e) {
    return false;
  }
}

/**
 * 是否是有效的对象字符串
 *
 * @example { foo: 'foo' }
 * @example [{ foo: 'foo' }]
 * TODO: 考虑箭头函数的情况 () => {}
 *
 * @param str
 * @returns
 */
export function isValidObjectString(str: string) {
  const obj = code2object(str);
  if (obj && typeof obj === 'object') {
    return true;
  }
  return false;
}

const templatePattern = /^\{(.+)\}$/s;

/**
 * 判断给定字符串是否为变量字符串
 * @example {[]}
 * @example {{}}
 * @example {this.foo}
 * @example {123}
 * @param str
 * @returns
 */
export function isVariableString(str: string) {
  // 先检查是否是简单的对象
  // TODO: 是不是可以忽略这个检查
  if (code2object(str)) {
    return false;
  }

  // 排除简单对象后，在用正则匹配
  return templatePattern.test(str);
}

/**
 * 是否为简单字符串，非变量字符串
 * @param str
 */
export function isPlainString(str: string) {
  const isString = typeof str === 'string';
  const isVarString = isString && isVariableString(str);
  return isString && !isVarString;
}

/**
 * 解析并获取变量字符串的内容
 * @param str
 * @returns
 */
export function getVariableContent(str: string) {
  const match = templatePattern.exec(str);
  if (match && match.length) {
    return match[1];
  }
  return str;
}

/**
 * 将代码放到函数体中进行执行
 * @param code
 * @returns 函数执行的结果
 */
export function executeCodeAsFunctionBody(code: string) {
  let ret;
  try {
    // eslint-disable-next-line no-new-func
    ret = new Function(code);
    ret = ret();
  } catch (err) {
    // ignore error
  }
  return ret;
}

// eslint-disable-next-line no-useless-escape
const objectWrapperPattern = /^[{\[].*[}\]]$/s;

/**
 * 将代码片段转成 js 对象
 * @param code 代码文本
 * @param isStrict 是否为严格模式
 * @returns
 */
export function code2object(code: string, isStrict = true) {
  // 非严格模式直接执行
  // 严格模式下需检测 code 是一个对象
  if (!isStrict || (isStrict && objectWrapperPattern.test(code))) {
    const ret = executeCodeAsFunctionBody(`return ${code}`);
    return typeof ret === 'object' ? ret : undefined;
  }
  return code;
}

const codeBlockPattern = /```(\w*)([\s\S]*?)```/g;

/**
 * 从 markdown 中解析出代码片段，仅返回第一个匹配的代码片段
 * @param markdown
 * @returns
 */
export function getCodeBlockFormMarkdown(markdown: string) {
  const match = codeBlockPattern.exec(markdown.trim());
  if (match && match.length) {
    return match[2];
  }
}
