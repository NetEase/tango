import * as t from '@babel/types';
import {
  ComponentPropType,
  ComponentPrototypeType,
  isNil,
  logger,
  uuid,
} from '@music163/tango-helpers';
import { getRelativePath, isFilepath } from './string';
import type { IImportDeclarationPayload, IImportSpecifierData } from '../types';
import { code2expression } from './ast';
import { isWrappedByExpressionContainer } from './assert';

export function prototype2importDeclarationData(
  prototype: ComponentPrototypeType,
  relativeFilepath?: string,
): { source: string; specifiers: IImportSpecifierData[] } {
  let source = prototype.package;
  if (relativeFilepath && isFilepath(source)) {
    source = getRelativePath(relativeFilepath, source);
  }
  if (source.endsWith('.js')) {
    source = source.slice(0, -3);
  }

  const specifiers: IImportSpecifierData[] = [];

  if (prototype.exportType === 'defaultExport') {
    specifiers.push({
      localName: prototype.name,
      type: 'ImportDefaultSpecifier',
    });
  } else {
    [prototype.name, ...(prototype.relatedImports || [])].forEach((item) => {
      specifiers.push({
        localName: item,
        type: 'ImportSpecifier',
      });
    });
  }

  return {
    source,
    specifiers,
  };
}

/**
 * 根据组件的 prototype 生成 ImportDeclarationPayload
 * @deprecated
 */
export function getImportDeclarationPayloadByPrototype(
  prototype: ComponentPrototypeType,
  relativeFilepath?: string,
): IImportDeclarationPayload {
  let defaultSpecifier;
  let specifiers;

  if (prototype.exportType === 'defaultExport') {
    defaultSpecifier = prototype.name;
    specifiers = prototype.relatedImports || [];
  } else {
    specifiers = [...(prototype.relatedImports || [])];
    if (prototype.type !== 'snippet') {
      specifiers.push(prototype.name);
    }
  }

  let sourcePath = prototype.package;
  if (relativeFilepath && isFilepath(sourcePath)) {
    sourcePath = getRelativePath(relativeFilepath, sourcePath);
  }
  if (sourcePath.endsWith('.js')) {
    sourcePath = sourcePath.slice(0, -3);
  }

  return {
    defaultSpecifier,
    specifiers,
    sourcePath,
  };
}

/**
 * 基于 key-value 生成 prop={value} 字符串
 * @param key
 * @param value
 * @returns
 */
function getPropKeyValuePair(item: ComponentPropType, generateValue: (...args: any[]) => string) {
  const key = item.name;

  let value = item.initValue;

  if (!value && item.autoInitValue) {
    value = generateValue(3);
  }

  if (isNil(value)) {
    return;
  }

  switch (typeof value) {
    case 'number':
    case 'boolean': {
      value = `{${value}}`;
      break;
    }
    case 'object': {
      // TIP: bugfix 如果 object 里有 jsx 或者 function 会失败
      try {
        value = `{${JSON.stringify(value)}}`;
      } catch (err) {
        logger.error(err);
      }
      break;
    }
    case 'function': {
      value = `{${(value as object).toString()}}`;
      break;
    }
    case 'string': {
      if (!isWrappedByExpressionContainer(value)) {
        // 不是变量字符串
        value = `"${value}"`;
      } else {
        // 如果是变量字符串，无需处理
      }
      break;
    }
    default:
      break;
  }
  return `${key}=${value}`;
}

/**
 * prototype -> <Button>hello</Button>
 * @param prototype
 */
export function prototype2code(prototype: ComponentPrototypeType) {
  let code;
  switch (prototype.type) {
    case 'snippet':
      code = prototype.initChildren || prototype.defaultChildren;
      break;
    default: {
      const keys =
        prototype.props?.reduce((acc, item) => {
          const pair = getPropKeyValuePair(item, (fractionDigits: number) =>
            uuid(prototype.name, fractionDigits),
          );
          return pair ? ` ${acc} ${pair}` : acc;
        }, '') || '';

      if (prototype.hasChildren) {
        code = `<${prototype.name} ${keys}>${
          prototype.initChildren || prototype.defaultChildren || ''
        }</${prototype.name}>`;
      } else {
        code = `<${prototype.name} ${keys.trim()} />`;
      }
      break;
    }
  }

  return code;
}

/**
 * 基于 prototype 信息生成 t.JSXElement
 * @example ButtonPrototype -> <Button>hello</Button> -> t.JSXElement
 * @param code
 */
export function prototype2jsxElement(prototype: ComponentPrototypeType) {
  const code = prototype2code(prototype);
  return code2expression(code) as t.JSXElement;
}
