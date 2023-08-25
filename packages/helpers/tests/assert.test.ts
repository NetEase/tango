import { isPlainObject } from '../src/helpers';

describe('helpers/assert', () => {
  it('isPlainObject', () => {
    expect(isPlainObject({})).toBeTruthy(); // true
    expect(isPlainObject({ aaa: 'aaa' })).toBeTruthy(); // true
    expect(isPlainObject([])).toBeFalsy(); // false
    expect(isPlainObject(null)).toBeFalsy(); // false
    expect(isPlainObject(new Date())).toBeFalsy(); // false
    expect(isPlainObject(/regex/)).toBeFalsy(); // false
    expect(isPlainObject(123)).toBeFalsy(); // false
    expect(isPlainObject('string')).toBeFalsy(); // false
    expect(isPlainObject(true)).toBeFalsy(); // false
  });
});
