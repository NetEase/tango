import { isWrappedCode } from '../src/helpers';

describe('helpers/codeHelper', () => {
  it('isWrappedCode', () => {
    expect(isWrappedCode('{{[]}}')).toBeTruthy(); // true
    expect(isWrappedCode('{{{}}}')).toBeTruthy(); // true
    expect(isWrappedCode('{{this.foo}}')).toBeTruthy(); // true
    expect(isWrappedCode('{{123}}')).toBeTruthy(); // true
    expect(isWrappedCode('{{() => {}}}')).toBeTruthy(); // true
    expect(isWrappedCode('{{<Button>button</Button>}}')).toBeTruthy(); // true
    expect(isWrappedCode('{{<>\n<Button>hello</Button>\n</>}}')).toBeTruthy(); // true
  });
});
