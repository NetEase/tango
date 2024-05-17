import * as t from '@babel/types';
import {
  IComponentProp,
  IComponentPrototype,
  Dict,
  logger,
  uuid,
  isWrappedCode,
  getCodeOfWrappedCode,
  wrapCodeWithJSXExpressionContainer,
} from '@music163/tango-helpers';
import { getRelativePath, isFilepath } from './string';
import type { IImportDeclarationPayload, IImportSpecifierData } from '../types';
import { code2expression } from './ast';
import { isWrappedByExpressionContainer } from './assert';
import { value2code } from './code-helpers';

export function prototype2importDeclarationData(
  prototype: IComponentPrototype,
  relativeFilepath?: string,
): { source: string; specifiers: IImportSpecifierData[] } {
  let source = prototype.package;
  const isSnippet = prototype.type === 'snippet';
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
    // 忽略代码片段 name
    [...(isSnippet ? [] : [prototype.name]), ...(prototype.relatedImports || [])].forEach(
      (item) => {
        specifiers.push({
          localName: item,
          type: 'ImportSpecifier',
        });
      },
    );
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
  prototype: IComponentPrototype,
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
 * @example { name: 'foo', initValue: false } >> name={false}
 * @example { name: 'foo', initValue: 1 } >> name={1}
 * @example { name: 'foo', initValue: () => {} } >> name={()=>{}}
 * @example { name: 'foo', initValue: { foo: 'bar' } } >> name={{ foo: 'bar' }}
 * @example { name: 'foo', initValue: [{ foo: 'bar' }] } >> name={[{ foo: 'bar' }]}
 * @example { name: 'foo', initValue: 'bar' } >> name="bar"
 * @example { name: 'foo', initValue: '{() => {}}' } >> name={()=>{}}
 * @example { name: 'foo', initValue: '{{() => {}}}' } >> name={() => {}}
 * @example { name: 'foo', initValue: '{bar}' } >> name={bar}
 * @returns
 */
export function propDataToKeyValueString(
  item: IComponentProp,
  generateValue?: (...args: any[]) => string,
) {
  const key = item.name;

  let value = item.initValue;

  if (!value && item.autoInitValue) {
    value = generateValue?.(3) || uuid(key, 3);
  }

  if (value === undefined) {
    return;
  }

  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'function': {
      value = wrapCodeWithJSXExpressionContainer(String(value));
      break;
    }
    case 'object': {
      try {
        value = wrapCodeWithJSXExpressionContainer(value2code(value));
      } catch (err) {
        logger.error(err);
      }
      break;
    }
    case 'string': {
      if (isWrappedCode(value)) {
        const innerCode = getCodeOfWrappedCode(value);
        value = wrapCodeWithJSXExpressionContainer(innerCode);
      } else if (isWrappedByExpressionContainer(value)) {
        // TIP: 兼容旧版逻辑，如果是变量字符串，无需处理
      } else {
        value = `"${value}"`;
      }
      break;
    }
    default:
      break;
  }
  return `${key}=${value}`;
}

/**
 * Button prototype -> <Button>hello</Button>
 *
 * @param prototype
 * @param extraProps
 */
export function prototype2code(prototype: IComponentPrototype, extraProps?: Dict) {
  let code;
  switch (prototype.type) {
    case 'snippet':
      code = prototype.initChildren || prototype.defaultChildren;
      break;
    default: {
      const propList: IComponentProp[] = extraProps
        ? Object.keys(extraProps).map((key) => ({
            name: key,
            initValue: extraProps[key],
          }))
        : [];
      // merge extraProps to props
      const props = [...(prototype.props || []), ...propList];

      const keys =
        props.reduce((acc, item) => {
          const pair = propDataToKeyValueString(item, (fractionDigits: number) =>
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
 *
 * @param prototype 组件的配置信息
 * @param props 额外的属性集
 */
export function prototype2jsxElement(prototype: IComponentPrototype, props?: Dict) {
  const code = prototype2code(prototype, props);
  return code2expression(code) as t.JSXElement;
}
