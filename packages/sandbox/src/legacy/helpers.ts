/**
 * @deprecated
 * @param code
 * @param options
 * @returns
 */
export function transformCodes(code: string, options?: any) {
  // @ts-ignore
  const ret = Babel.transform(code, {
    presets: [
      [
        'env',
        {
          modules: 'systemjs',
        },
      ],
      'react',
    ],
    ...options,
  });
  return {
    code: ret.code,
    // uri: `data:application/javascript;charset=utf-8;base64,${btoa(ret.code)}`
  };
}

/**
 * @deprecated
 * @param url
 * @returns
 */
export function ignoreNoVersonPackage(url: string) {
  if (
    !/(([0-9]|([1-9]([0-9]*))).){2}([0-9]|([1-9]([0-9]*)))/.exec(url) &&
    url.indexOf('api/v1/readHistoryFile') === -1
  ) {
    console.warn('找不到npm包版本号：', url);
    const tpl = `define("${url}", [], {})`;
    eval(tpl);
    return true;
  }
  return false;
}

export function code2browser(code: string, options: any = {}) {
  const { fileName, beautify = false } = options;
  // code = beautify ? format(code) : code;
  // @ts-ignore
  return Babel.transform(code, {
    presets: ['es2015', 'react'],
    plugins: [
      ['proposal-decorators', { legacy: true }],
      ['proposal-class-properties', { loose: true }],
    ],
    ast: false,
    sourceMaps: false,
    filename: fileName,
  }).code;
}
