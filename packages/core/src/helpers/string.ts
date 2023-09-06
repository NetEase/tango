import path from 'path';
import { value2node, expression2code } from './ast';
import { FileType } from './../types';

/**
 * 推断JS模块类型
 */
export function inferFileType(filename: string): FileType {
  // 增加 tangoConfigJson Module
  if (/\/tango\.config\.json$/.test(filename)) {
    return FileType.TangoConfigJson;
  }

  if (/\/appJson\.json$/.test(filename)) {
    return FileType.AppJson;
  }

  if (/\/package\.json$/.test(filename)) {
    return FileType.PackageJson;
  }

  if (/\/routes\.js$/.test(filename)) {
    return FileType.RouteModule;
  }

  // 所有 pages 下的 js 文件均认为是有效的 viewModule
  if (/\/pages\/.+\.jsx?$/.test(filename)) {
    return FileType.JsxViewModule;
  }

  // 所有 pages 下的 js 文件均认为是有效的 viewModule
  if (/\/pages\/.+\.schema\.json?$/.test(filename)) {
    return FileType.JsonViewModule;
  }

  // FIXME: 暂时写死，后续要支持多 services 文件解析
  if (/\/services\/index.js$/.test(filename)) {
    return FileType.ServiceModule;
  }

  if (/service\.js$/.test(filename)) {
    return FileType.ServiceModule;
  }

  if (/\/stores\/index\.js$/.test(filename)) {
    return FileType.StoreEntryModule;
  }

  if (/\/stores\/.+\.js$/.test(filename)) {
    return FileType.StoreModule;
  }

  if (/\/blocks\/[\w-]+\/index\.js/.test(filename)) {
    return FileType.BlockEntryModule;
  }

  if (/\.jsx?$/.test(filename)) {
    return FileType.Module;
  }

  if (/\.json$/.test(filename)) {
    return FileType.Json;
  }

  if (/\.less$/.test(filename)) {
    return FileType.Less;
  }

  if (/\.scss$/.test(filename)) {
    return FileType.Scss;
  }

  return FileType.File;
}

/**
 * 判断组件名是否合法
 * @example Button -> valid
 * @example div -> invalid
 * @param name
 * @returns
 */
export function isValidComponentName(name: string) {
  if (!name) {
    return false;
  }

  const firstChar = name.charAt(0);
  return firstChar === firstChar.toUpperCase();
}

/**
 * 转为驼峰
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
 * 将输入字符串转换为大驼峰格式
 * @example about -> About
 * @example not-found -> NotFound
 * @param str
 */
export function upperCamelCase(str: string) {
  const text = camelCase(str.toLowerCase());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * 从 filename 中解析获得 moduleName
 * @example /stores/user.js -> user
 * @example /services/foo-bar.js -> fooBar
 * @param filename
 */
export function getModuleNameByFilename(filename: string) {
  const parts = filename.split('/');
  let name = parts[parts.length - 1];
  name = name.split('.')[0];
  return camelCase(name);
}

/**
 * 基于路由名生成文件路径
 * @param routePath 路由地址
 * @param baseDir base dir
 * @param ext 后缀名
 * @returns
 */
export function getFilepath(routePath: string, baseDir: string, ext = '') {
  if (routePath.startsWith('/')) {
    routePath = routePath.substring(1);
  }
  const filename = routePath.replaceAll('/:', '@').split('/').join('-');
  if (!baseDir.endsWith('/')) {
    baseDir = `${baseDir}/`;
  }
  return `${baseDir}${filename}${ext}`;
}

export function getPrivilegeCode(appName: string, routePath: string) {
  return `${appName}@${routePath.replaceAll('/', '%')}`;
}

const prettier = (window as any).prettier;
const prettierPlugins = (window as any).prettierPlugins;

/**
 * 格式化代码
 * @param code original source code
 * @param parser prettier parser, see https://prettier.io/docs/en/options.html#parser
 * @returns the formatted code
 */
export function formatCode(code: string, parser = 'babel') {
  if (prettier && prettierPlugins) {
    return prettier.format(code, { parser, plugins: prettierPlugins });
  }
  return code;
}

/**
 * 将 js value 转换为代码字符串
 */
export function value2code(value: any) {
  const node = value2node(value);
  const code = expression2code(node);
  return code;
}

/**
 * 是否匹配路由
 * @example isPathnameMatchRoute('/user/123', '/users/:id') -> true
 */
export function isPathnameMatchRoute(pathname: string, route: string) {
  if (!pathname) {
    return false;
  }

  pathname = pathname.split('?')[0];

  if (pathname === route) {
    return true;
  }

  const str = route.replaceAll(/:\w+/gi, '\\w+');
  const pt = new RegExp(`^${str}$`, 'i');
  return pt.test(pathname);
}

/**
 * 根据文件路径计算区块的名字
 * @param filename 文件路径
 * @return 返回计算后的区块名（大驼峰）
 */
export function getBlockNameByFilename(filename: string) {
  const name = filename.split('/').slice(-2, -1)[0];
  return upperCamelCase(name);
}

/**
 * FIXME: 有问题，需要优化下
 * 基于 from 文件的地址计算 to 文件的相对引用路径
 * @param from
 * @param to
 */
export function getRelativePath(from: string, to: string) {
  const fromFolder = path.dirname(from);
  return path.relative(fromFolder, to);
}

/**
 * 判断给定字符串是否是文件路径
 * @example ./pages/index.js -- yes
 * @example ../pages/index.js -- yes
 * @example /src/pages/index.js -- yes
 * @example @music163/tango-designer -- no
 * @param str
 */
export function isFilepath(str: string) {
  return /^(\.\.?\/|\/).*\.[a-z]+$/.test(str);
}
