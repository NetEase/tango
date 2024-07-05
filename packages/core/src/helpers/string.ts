import path from 'path';
import { camelCase, logger, upperCamelCase } from '@music163/tango-helpers';
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

  if (/\/(blocks|components)\/index\.js/.test(filename)) {
    return FileType.ComponentsEntryModule;
  }

  if (/\/services\/.+\.js$/.test(filename)) {
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
 * @example isStrict ? div -> invalid : div -> valid
 * @param name
 * @param isStrict 是否严格模式（严格模式不匹配原生标签）
 * @returns
 */
export function isValidComponentName(name: string, isStrict = false) {
  if (!name) {
    return false;
  }

  if (!isStrict) {
    return true;
  }

  const firstChar = name.charAt(0);
  return firstChar === firstChar.toUpperCase();
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
  // 格式化出错时，返回原始代码，避免 AST 解析崩溃
  if (prettier && prettierPlugins) {
    try {
      return prettier.format(code, { parser, plugins: prettierPlugins });
    } catch (error) {
      logger.error('[prettier lint code failed!]', error);
      return code;
    }
  }
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
 * 合并两个路径
 * @param root
 * @param filename
 * @returns
 */
export function getFullPath(root: string, filename: string) {
  return path.join(root, filename);
}

/**
 * 计算 targetFile 在 sourceFile 中的相对引用路径
 * @param sourceFile
 * @param targetFile
 * @returns
 */
export function getRelativePath(sourceFile: string, targetFile: string) {
  sourceFile = path.dirname(sourceFile);
  return path.relative(sourceFile, targetFile);
}

/**
 * 判断给定字符串是否是文件路径
 * @example ./pages/index.js -- yes
 * @example ../pages/index.js -- yes
 * @example ../components -- yes
 * @example /src/pages/index.js -- yes
 * @example @music163/tango-designer -- no
 * @param str
 */
export function isFilepath(str: string) {
  return /^(\.\.?\/|\/).*(\.[a-z]+)?$/.test(str);
}
