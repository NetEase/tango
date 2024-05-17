import { propDataToKeyValueString } from '../src/helpers';

describe('prototype helpers', () => {
  it('propDataToKeyValueString', () => {
    // basic
    expect(propDataToKeyValueString({ name: 'foo', initValue: 'bar' })).toEqual('foo="bar"');
    expect(propDataToKeyValueString({ name: 'foo', initValue: 1 })).toEqual('foo={1}');
    expect(propDataToKeyValueString({ name: 'foo', initValue: false })).toEqual('foo={false}');
    expect(propDataToKeyValueString({ name: 'foo', initValue: null })).toEqual('foo={null}');
    expect(propDataToKeyValueString({ name: 'foo', initValue: [] })).toEqual('foo={[]}');
    expect(propDataToKeyValueString({ name: 'foo', initValue: {} })).toEqual('foo={{}}');
    expect(propDataToKeyValueString({ name: 'foo', initValue: () => {} })).toEqual(
      'foo={() => {}}',
    );
    expect(propDataToKeyValueString({ name: 'foo', initValue: { foo: 'bar' } })).toEqual(
      'foo={{ foo: "bar" }}',
    );
    expect(propDataToKeyValueString({ name: 'foo', initValue: [{ foo: 'bar' }] })).toEqual(
      'foo={[{ foo: "bar" }]}',
    );

    // wrapped code
    expect(
      propDataToKeyValueString({ name: 'foo', initValue: '{{<Placeholder text="放置替换" />}}' }),
    ).toEqual('foo={<Placeholder text="放置替换" />}');
    expect(propDataToKeyValueString({ name: 'foo', initValue: '{{tango}}' })).toEqual(
      'foo={tango}',
    );
    expect(propDataToKeyValueString({ name: 'foo', initValue: '{{"bar"}}' })).toEqual(
      'foo={"bar"}',
    );
    expect(propDataToKeyValueString({ name: 'foo', initValue: '{{() => {}}}' })).toEqual(
      'foo={() => {}}',
    );

    // compatible with old version
    expect(propDataToKeyValueString({ name: 'foo', initValue: '{() => {}}' })).toEqual(
      'foo={() => {}}',
    );
    expect(
      propDataToKeyValueString({ name: 'foo', initValue: '{<Placeholder text="放置替换" />}' }),
    ).toEqual('foo={<Placeholder text="放置替换" />}');
    // expect(propDataToKeyValueString({ name: 'foo', initValue: '{tango}' })).toEqual('foo={tango}');
  });
});
