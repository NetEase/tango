import { isString } from './assert';

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

const templatePattern = /^{{(.+)}}$/s;

/**
 * 判断给定代码是否被双花括号包裹
 * @example {{[]}}
 * @example {{{}}}
 * @example {{this.foo}}
 * @example {{123}}
 * @param str
 * @returns
 */
export function isWrappedCode(str: string) {
  // 排除简单对象后，再用正则匹配
  return templatePattern.test(str);
}

export const isVariableString = isWrappedCode;

/**
 * 从包裹的代码中获取代码内容
 * @param str
 * @returns
 */
export function getCodeOfWrappedCode(str: string) {
  const match = templatePattern.exec(str);
  if (match && match.length) {
    return match[1];
  }
  return str;
}

export const getVariableContent = getCodeOfWrappedCode;

/**
 * 给输入代码加上双花括号 code -> {{code}}
 * @example foo -> {{foo}}
 * @example "hello" => {{"hello"}}
 * @example () => {} => {{() => {}}}
 *
 * @param code 输入代码
 * @returns 加上花括号后的代码
 */
export function wrapCode(code: string) {
  if (isWrappedCode(code)) {
    return code;
  }
  return `{{${code}}}`;
}

/**
 * 使用 JSX 表达式容器包裹代码
 * @example foo -> {foo}
 * @example "hello" => {"hello"}
 * @param code
 * @returns
 */
export function wrapCodeWithJSXExpressionContainer(code: string) {
  return `{${code}}`;
}

/**
 * 是否为简单字符串，非变量字符串
 * @param str
 */
export function isPlainString(str: string) {
  const isWrapped = isString(str) && isWrappedCode(str);
  return isString && !isWrapped;
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

export function url2serviceName(url: string) {
  if (url.startsWith('http')) {
    // 去除域名前缀
    url = url
      .replace(/https?:\/\//, '')
      .split('/')
      .slice(1)
      .join('/');
  }

  return (
    url
      // 去除 api + 模块名前缀
      // - 云音乐 api 规范为 /api/模块名/
      // - 后端公技基本使用 /模块名/api/
      // - 中台类服务似乎常用 /api/middle/模块名/
      // 目前的实现是去除了模块名，只干掉 /api/middle/ 和 /api/backend/ 这种常用前缀
      .replace(/^\/[^/]+?\/api\/|^\/api\/middle\/|^\/api\/backend\/|^\/api\//, '')
      // 去除路由参数
      .replace(/\/\{.*?\}/, '')
      // 忽略下划线与减号，将后面的字符转成大驼峰
      .replace(/[-/_]+\w/g, (str) => str.replace(/[-/_]+/, '').toUpperCase())
      // 首字母转小写
      .replace(/^./, (str) => str.toLowerCase())
      // 方法名以数字开头，添加 api 前缀
      .replace(/^\d/, (str) => `api${str}`)
  );
}

/**
 * 解析状态变量的 path
 * @example stores.foo.bar => { storeName: 'foo', variableName: 'bar' }
 * @example stores.user.count => { storeName: 'user', variableName: 'count' }
 *
 * @param variablePath
 * @returns
 */
export function parseStoreVariablePath(variablePath: string) {
  const [, storeName, variableName] = variablePath.split('.');
  return {
    storeName,
    variableName,
  };
}

/**
 * 解析服务变量的 path
 * @param variablePath
 * @returns
 *
 * @example services.list => { moduleName: 'index', name: 'list' }
 * @example services.sub.list => { moduleName: 'sub', name: 'list' }
 * @example foo => undefined
 */
export function parseServiceVariablePath(variablePath: string) {
  const parts = variablePath.split('.');
  if (parts[0] !== 'services') {
    return {};
  }

  let moduleName = 'index';
  let name = '';
  switch (parts.length) {
    case 2: {
      name = parts[1];
      break;
    }
    case 3: {
      moduleName = parts[1];
      name = parts[2];
      break;
    }
    default:
      break;
  }
  return {
    moduleName,
    name,
  };
}
