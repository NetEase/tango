import {
  object2node,
  serviceConfig2Node,
  isValidCode,
  isValidExpressionCode,
  code2expression,
} from '../src/helpers';

describe('ast helpers', () => {
  it('isValidCode', () => {
    expect(isValidCode('() => { hello world }')).toBeFalsy();
    expect(isValidCode('function() {}')).toBeFalsy();
  });

  it('isValidExpression', () => {
    expect(isValidExpressionCode('() => { }')).toBeTruthy();
    expect(isValidExpressionCode('1')).toBeTruthy();
    expect(isValidExpressionCode('"hello"')).toBeTruthy();
    expect(isValidExpressionCode('false')).toBeTruthy();
    expect(isValidExpressionCode('{ bizId: "vip", type: "category" }')).toBeTruthy();
    expect(isValidExpressionCode('[1,2,3]')).toBeTruthy();
    expect(isValidExpressionCode('<div>hello</div>')).toBeTruthy();
    expect(isValidExpressionCode('<div>hello</div>')).toBeTruthy();
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
    expect(code2expression('{ type: window.bar }').type).toEqual('ObjectExpression');
    expect(code2expression('{tango}').type).toEqual('ObjectExpression'); // FIXME: 这种不应该解析通过
  });
});
