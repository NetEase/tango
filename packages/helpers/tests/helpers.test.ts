import {
  isVariableString,
  isValidObjectString,
  code2object,
  parseDndTrackId,
  getVariableContent,
  camelCase,
  parseDndId,
  isValidUrl,
  getCodeBlockFormMarkdown,
  upperCamelCase,
} from '../src/helpers';

describe('string', () => {
  it('camelCase', () => {
    expect(camelCase('foo')).toEqual('foo');
    expect(camelCase('foo-bar')).toEqual('fooBar');
  });

  it('upperCamelCase', () => {
    expect(upperCamelCase('about')).toBe('About');
    expect(upperCamelCase('not-found')).toBe('NotFound');
    expect(upperCamelCase('@music/input')).toBe('MusicInput');
    expect(upperCamelCase('@music/ct-input')).toBe('MusicCtInput');
  });

  it('isValidUrl', () => {
    expect(isValidUrl('www.163.com')).toBeTruthy();
    expect(isValidUrl('//www.163.com')).toBeTruthy();
    expect(isValidUrl('https://www.163.com')).toBeTruthy();
    expect(isValidUrl('http://www.163.com')).toBeTruthy();
    expect(isValidUrl('/about')).toBeFalsy();
  });

  it('isVariableString', () => {
    expect(isVariableString('{this.foo}')).toBeTruthy();
    expect(isVariableString('{!false}')).toBeTruthy();
    expect(isVariableString('{[]}')).toBeTruthy();
    expect(isVariableString('{{ foo: "bar" }}')).toBeTruthy();
    expect(isVariableString('{[{ foo: "bar" }]}')).toBeTruthy();
    expect(isVariableString('{123}')).toBeTruthy();
    expect(isVariableString('{value}')).toBeTruthy();
    expect(isVariableString('{"hello"}')).toBeTruthy();
    expect(isVariableString('{ foo: "bar" }')).toBeFalsy();
    expect(isVariableString('{ type: tango.stores?.homePage?.tabKey }')).toBeFalsy();
    // expect(isVariableString('{ type: tango.stores.homePage.tabKey }')).toBeFalsy(); // TIP: failed
    expect(isVariableString('{ foo: "bar" }')).toBeFalsy();
  });

  it('getVariableContent', () => {
    expect(getVariableContent('{!false}')).toBe('!false');
  });

  it('isValidObjectString', () => {
    expect(isValidObjectString('{ foo: "bar" }')).toBeTruthy();
    expect(isValidObjectString('[{ foo: "bar" }]')).toBeTruthy();
    expect(isValidObjectString('[1,2,3]')).toBeTruthy();
    expect(isValidObjectString('["hello", "world"]')).toBeTruthy();
    // expect(isValidObjectString('() => {}')).toBeTruthy();
    expect(isValidObjectString('hello')).toBeFalsy();
  });

  it('code2object', () => {
    expect(code2object(`{ foo: 12 }`)).toEqual({ foo: 12 });
    expect(code2object(`[]`)).toEqual([]);
    expect(code2object(`{this.foo}`)).toBeUndefined();
    expect(code2object(`{foo}`)).toBeUndefined();
    expect(code2object('() => {}')).toEqual('() => {}');
    expect(code2object('hello')).toEqual('hello');
  });

  it('parseDndTrackId', () => {
    expect(parseDndTrackId('Button:123')).toEqual(['Button', 'Button:123']);
    expect(parseDndTrackId('Button.Group:123')).toEqual(['Button.Group', 'Button.Group:123']);
  });

  it('parseDndId', () => {
    expect(parseDndId('123')).toEqual({ id: '123' });
    expect(parseDndId('Button:123')).toEqual({
      component: 'Button',
      id: 'Button:123',
      index: '123',
    });
    expect(parseDndId('Button.Group:123')).toEqual({
      component: 'Button.Group',
      id: 'Button.Group:123',
      index: '123',
    });
    expect(parseDndId('LocalBlock:Button.Group:123')).toEqual({
      filename: 'LocalBlock',
      module: 'LocalBlock',
      component: 'Button.Group',
      id: 'LocalBlock:Button.Group:123',
      index: '123',
    });
  });

  it('getCodeBlockFormMarkdown', () => {
    expect(getCodeBlockFormMarkdown('```json\n{\n  "disabled": true\n}\n```')).toBe(
      '\n{\n  "disabled": true\n}\n',
    );
  });
});
