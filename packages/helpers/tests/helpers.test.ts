import {
  isVariableString,
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
    expect(camelCase('Button')).toEqual('button');
    expect(camelCase('DatePicker')).toEqual('datePicker');
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
    expect(isVariableString('{{this.foo}}')).toBeTruthy();
    expect(isVariableString('{{!false}}')).toBeTruthy();
    expect(isVariableString('{{[]}}')).toBeTruthy();
    expect(isVariableString('{{{ foo: "bar" }}}')).toBeTruthy();
    expect(isVariableString('{{[{ foo: "bar" }]}}')).toBeTruthy();
    expect(isVariableString('{{123}}')).toBeTruthy();
    expect(isVariableString('{{value}}')).toBeTruthy();
    expect(isVariableString('{{"hello"}}')).toBeTruthy();
    expect(isVariableString('{ foo: "bar" }')).toBeFalsy();
    expect(isVariableString('{ type: tango.stores?.homePage?.tabKey }')).toBeFalsy();
    expect(isVariableString('{ type: tango.stores.homePage.tabKey }')).toBeFalsy();
    expect(isVariableString('{ foo: "bar" }')).toBeFalsy();
  });

  it('getVariableContent', () => {
    expect(getVariableContent('{{!false}}')).toBe('!false');
  });

  it('parseDndTrackId', () => {
    expect(parseDndTrackId('Button:123')).toEqual(['Button', 'Button:123']);
    expect(parseDndTrackId('Button.Group:123')).toEqual(['Button.Group', 'Button.Group:123']);
  });

  it('parseDndId', () => {
    expect(parseDndId('123')).toEqual({ id: '123' });
    expect(parseDndId('Button:button123')).toEqual({
      component: 'Button',
      id: 'Button:button123',
      codeId: 'button123',
    });
    expect(parseDndId('Button.Group:buttonGroup123')).toEqual({
      component: 'Button.Group',
      id: 'Button.Group:buttonGroup123',
      codeId: 'buttonGroup123',
    });
    expect(parseDndId('LocalBlock:Button.Group:buttonGroup123')).toEqual({
      id: 'LocalBlock:Button.Group:buttonGroup123',
      filename: 'LocalBlock',
      component: 'Button.Group',
      codeId: 'buttonGroup123',
    });
  });

  it('getCodeBlockFormMarkdown', () => {
    expect(getCodeBlockFormMarkdown('```json\n{\n  "disabled": true\n}\n```')).toBe(
      '\n{\n  "disabled": true\n}\n',
    );
  });
});
