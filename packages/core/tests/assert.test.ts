import { isTangoVariable } from '../src/helpers';

describe('assert', () => {
  it('isTangoVariable', () => {
    expect(isTangoVariable('tango.stores.app.name')).toBeTruthy();
    expect(isTangoVariable('tango.stores?.app?.name')).toBeTruthy();
    expect(isTangoVariable('tango.stores.app?.name')).toBeTruthy();
    // expect(isTangoVariable('tango.copyToClipboard')).toBeTruthy();
  });
});
