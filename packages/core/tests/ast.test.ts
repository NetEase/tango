import { Identifier } from '@babel/types';
import {
  object2node,
  serviceConfig2Node,
  isValidCode,
  isValidExpressionCode,
  code2expression,
  value2jsxAttributeValueNode,
} from '../src/helpers';

describe('ast helpers', () => {
  it('isValidCode', () => {
    expect(isValidCode('1')).toBeTruthy();
    expect(isValidCode('"hello"')).toBeTruthy();
    expect(isValidCode('<div>hello</div>')).toBeTruthy();
    expect(isValidCode('function fn() {}')).toBeTruthy();

    // invalid function body
    expect(isValidCode('() => { hello world }')).toBeFalsy();
    // invalid function
    expect(isValidCode('function() {}')).toBeFalsy();
  });

  it('isValidExpressionCode', () => {
    expect(isValidExpressionCode('() => { }')).toBeTruthy();
    expect(isValidExpressionCode('1')).toBeTruthy();
    expect(isValidExpressionCode('a = 1')).toBeTruthy();
    expect(isValidExpressionCode('1 + 1')).toBeTruthy();
    expect(isValidExpressionCode('"hello"')).toBeTruthy();
    expect(isValidExpressionCode('false')).toBeTruthy();
    expect(isValidExpressionCode('{ bizId: "vip", type: "category" }')).toBeTruthy();
    expect(isValidExpressionCode('[1,2,3]')).toBeTruthy();
    expect(isValidExpressionCode('<div>hello</div>')).toBeTruthy();
    expect(isValidExpressionCode('tango.stores.app.title')).toBeTruthy();
    expect(isValidExpressionCode('"hello" + window.location.path')).toBeTruthy();

    expect(isValidExpressionCode('{1}')).toBeFalsy();
    expect(isValidExpressionCode('{"1"}')).toBeFalsy();
    expect(isValidExpressionCode('{ 1+1 }')).toBeFalsy();
    expect(isValidExpressionCode('{<div>aaa</div>}')).toBeFalsy();
    expect(isValidExpressionCode('{() => {}}')).toBeFalsy();
    expect(isValidExpressionCode('{[1,2,3]}')).toBeFalsy();
    expect(isValidExpressionCode('{tango.stores.app.title}')).toBeFalsy();
  });

  it('object2node', () => {
    const node = object2node({
      url: '/api/backend/clientversion/appmarket/list',
      method: 'POST',
      formatter: '',
      apiId: 647341,
    });
    expect(node.type).toEqual('ObjectExpression');
  });

  test('serviceConfig2Node', () => {
    const node = serviceConfig2Node({
      formatter: '',
      method: 'get',
      url: 'https://nei.hz.netease.com/api/apimock-v2/cc974ffbaa7a85c77f30e4ce67deb67f/api/app-list',
    } as any);
    expect(node.type).toEqual('ObjectExpression');
  });

  it('code2expression', () => {
    expect(code2expression('')).toBeUndefined();
    expect(code2expression('tango.stores.app').type).toBe('MemberExpression');
    expect(code2expression('{ type: window.bar }').type).toEqual('ObjectExpression');
    expect(code2expression('() => {};').type).toEqual('ArrowFunctionExpression');
    expect(code2expression('<Button>hello</Button>').type).toBe('JSXElement');
    expect(code2expression('<BreadcrumbItem children="节点名称" />').type).toBe('JSXElement');

    const arrayCode = `
    [
      { label: 'foo', value: 'foo' },
      { label: 'bar', value: 'bar' },
    ]
    `;
    expect(code2expression(arrayCode).type).toEqual('ArrayExpression');
  });

  it('value2jsxAttributeValueNode', () => {
    expect(value2jsxAttributeValueNode('hello').type).toBe('StringLiteral');
    expect(value2jsxAttributeValueNode(true).type).toBe('JSXExpressionContainer');
    expect(value2jsxAttributeValueNode(1).type).toBe('JSXExpressionContainer');
    expect(value2jsxAttributeValueNode('{{{ foo: "foo"}}}').type).toBe('JSXExpressionContainer');

    // invalid code will return undefined
    const node: any = value2jsxAttributeValueNode('{{tango.xx+}}');
    expect(node.type).toBe('JSXExpressionContainer');
    expect((node.expression as Identifier).name).toBe('undefined');
  });
});
