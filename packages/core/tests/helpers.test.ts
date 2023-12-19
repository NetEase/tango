import { JSXElement } from '@babel/types';
import {
  code2ast,
  code2expression,
  value2node,
  value2code,
  expression2code,
  expressionCode2ast,
  isPathnameMatchRoute,
  namesToImportDeclarations,
  getBlockNameByFilename,
  getRelativePath,
  isFilepath,
  isValidComponentName,
  getFilepath,
  getPrivilegeCode,
  getJSXElementAttributes,
  inferFileType,
  deepCloneNode,
} from '../src/helpers';
import { FileType } from '../src/types';

describe('helpers', () => {
  it('code2ast', () => {
    expect(code2ast('function App() {}').type).toEqual('File');
  });

  it('parse jsxElement attributes', () => {
    const node = code2expression(
      "<XColumn dataIndex='col' enumMap={{ 1: '已解决', 2: '未解决' }} />",
    );
    const attributes = getJSXElementAttributes(node as JSXElement);
    expect(attributes).toEqual({
      dataIndex: 'col',
      enumMap: {
        1: '已解决',
        2: '未解决',
      },
    });
  });

  it('value2node: number', () => {
    expect(value2node(1).type).toEqual('NumericLiteral');
  });

  it('value2node: string', () => {
    expect(value2node('hello').type).toEqual('StringLiteral');
  });

  it('value2node: arrowFunction', () => {
    const node = value2node(() => {});
    expect(node.type).toEqual('ArrowFunctionExpression');
  });

  it('value2node: object', () => {
    const node = value2node({
      num: 1,
      str: 'string',
      fn: () => {},
      nest: '{this.hello}',
    });
    expect(node.type).toEqual('ObjectExpression');
  });

  it('expression2code: functionExpression', () => {
    expect(expression2code(code2expression('function(){}'))).toEqual('function () {}');
  });

  it('expression2code: arrowFunctionExpression', () => {
    expect(expression2code(code2expression('() => {}'))).toEqual('() => {}');
  });

  it('expression2code: memberExpression', () => {
    expect(expression2code(code2expression('this.foo.bar'))).toEqual('this.foo.bar');
  });

  it('expression2code: identifier', () => {
    expect(expression2code(code2expression('data'))).toEqual('data');
  });

  it('expressionCode2ast', () => {
    expect(expressionCode2ast('<Button>hello</Button>').type).toEqual('File');
    expect(expressionCode2ast('{<Button>hello</Button>}').type).toEqual('File');
    expect(expressionCode2ast('() => <Button>hello</Button>').type).toEqual('File');
    expect(expressionCode2ast('{() => <Button>hello</Button>}').type).toEqual('File');
  });
});

describe('string helpers', () => {
  it('value2code: empty array', () => {
    expect(value2code([])).toEqual('[]');
  });

  it('value2code: array', () => {
    expect(value2code([{ label: 'foo' }])).toEqual('[{ label: "foo" }]');
  });

  it('value2code: object', () => {
    expect(value2code({ width: 200 })).toEqual('{ width: 200 }');
  });

  it('isPathnameMatchRoute', () => {
    expect(isPathnameMatchRoute('/user/123', '/user/:id')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/123?foo=bar', '/user/:id')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/:id', '/user/:id')).toBeTruthy();
    expect(isPathnameMatchRoute('/user', '/user')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/123/modify/123', '/user/:uid/modify/:rid')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/123', '/user')).toBeFalsy();
  });

  it('namesToImportDeclarations', () => {
    expect(
      namesToImportDeclarations(['Button', 'Box', 'React'], {
        Button: { source: '@music163/antd' },
        Box: { source: '@music163/antd' },
        React: { source: 'react', isDefault: true },
      }),
    ).toEqual([
      { sourcePath: '@music163/antd', specifiers: ['Button', 'Box'] },
      { sourcePath: 'react', defaultSpecifier: 'React' },
    ]);
  });

  it('getBlockNameByFilename', () => {
    expect(getBlockNameByFilename('/src/blocks/local-comp/index.js')).toEqual('LocalComp');
  });

  it('getRelativePath', () => {
    expect(getRelativePath('/src/pages/index.js', '/src/blocks/sample-block/index.js')).toEqual(
      '../blocks/sample-block/index.js',
    );
    expect(getRelativePath('/src/pages/index.js', '/src/components')).toEqual('../components');
    expect(getRelativePath('/src/pages/index.js', '/src/components/input.js')).toEqual(
      '../components/index.js',
    );
  });

  it('getFilepath', () => {
    expect(getFilepath('/user', '/src/pages')).toBe('/src/pages/user');
    expect(getFilepath('/user/:id', '/src/pages')).toBe('/src/pages/user@id');
    expect(getFilepath('/user/detail', '/src/pages')).toBe('/src/pages/user-detail');
  });

  it('isFilepath', () => {
    expect(isFilepath('./pages/index.js')).toBeTruthy();
    expect(isFilepath('../pages/index.js')).toBeTruthy();
    expect(isFilepath('./pages/index.css')).toBeTruthy();
    expect(isFilepath('./src/pages/index.js')).toBeTruthy();
    expect(isFilepath('./src/components')).toBeTruthy();
    expect(isFilepath('../src/components')).toBeTruthy();
    expect(isFilepath('path')).toBeFalsy();
    expect(isFilepath('path-browserify')).toBeFalsy();
    expect(isFilepath('@music/one')).toBeFalsy();
  });

  it('getPrivilegeCode', () => {
    expect(getPrivilegeCode('sample-app', '/user')).toBe('sample-app@%user');
    expect(getPrivilegeCode('sample-app', '/user/:id')).toBe('sample-app@%user%:id');
  });

  it('isValidComponentName', () => {
    expect(isValidComponentName('Button')).toBeTruthy();
    expect(isValidComponentName('Button.Group')).toBeTruthy();
  });

  it('inferFileType', () => {
    expect(inferFileType('/src/pages/template.js')).toBe(FileType.JsxViewModule);
    expect(inferFileType('/src/pages/template.jsx')).toBe(FileType.JsxViewModule);
    expect(inferFileType('/src/pages/template.ejs')).toBe(FileType.File);
    expect(inferFileType('/src/index.scss')).toBe(FileType.Scss);
    expect(inferFileType('/src/index.less')).toBe(FileType.Less);
    expect(inferFileType('/src/index.json')).toBe(FileType.Json);
  });
});

describe('schema helpers', () => {
  const schema = {
    id: 'Section:1',
    component: 'Section',
    props: {
      id: '111',
    },
    children: [
      {
        id: 'Button:1',
        component: 'Button',
        props: {
          id: '222',
        },
      },
      {
        id: 'Button:2',
        component: 'Button',
        props: {
          id: '333',
        },
      },
    ],
  };
  const cloned = deepCloneNode(schema);
  expect(cloned.props.id).toBe(schema.props.id);
  expect(cloned.children[0].props.id).toBe(schema.children[0].props.id);

  expect(cloned.id).not.toBe(schema.id);
  expect(cloned.children[0].id).not.toBe(schema.children[0].id);
});
