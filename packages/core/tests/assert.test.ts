import { isTangoVariable, isWrappedByExpressionContainer } from '../src/helpers';

describe('assert', () => {
  it('isTangoVariable', () => {
    expect(isTangoVariable('tango.stores.app.name')).toBeTruthy();
    expect(isTangoVariable('tango.stores?.app?.name')).toBeTruthy();
    expect(isTangoVariable('tango.stores.app?.name')).toBeTruthy();
    // expect(isTangoVariable('tango.copyToClipboard')).toBeTruthy();
  });

  it('isWrappedByExpressionContainer', () => {
    expect(isWrappedByExpressionContainer('{this.foo}')).toBeTruthy();
    expect(isWrappedByExpressionContainer('{!false}')).toBeTruthy();
    expect(isWrappedByExpressionContainer('{[]}')).toBeTruthy();
    expect(isWrappedByExpressionContainer('{{ foo: "bar" }}')).toBeTruthy();
    expect(isWrappedByExpressionContainer('{[{ foo: "bar" }]}')).toBeTruthy();
    expect(isWrappedByExpressionContainer('{123}')).toBeTruthy();
    expect(isWrappedByExpressionContainer('{"hello"}')).toBeTruthy();
    expect(isWrappedByExpressionContainer('{ foo: "bar" }')).toBeFalsy();
    expect(isWrappedByExpressionContainer('{ type: tango.stores?.homePage?.tabKey }')).toBeFalsy();
    expect(isWrappedByExpressionContainer('{ type: tango.stores.homePage.tabKey }')).toBeFalsy();
    expect(isWrappedByExpressionContainer('{ foo: "bar" }')).toBeFalsy();
    expect(isWrappedByExpressionContainer('{ color: tango.stores.app.color }')).toBeFalsy();
  });
});
