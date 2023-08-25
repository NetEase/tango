import path from 'path';

const resolvePackageIndex = (relativeEntry: string) =>
  path.resolve(__dirname, '../../../packages/', relativeEntry);

export default {
  routes: [
    {
      exact: true,
      path: '/',
      component: 'index',
      name: '首页',
    },
  ],
  devServer: {
    host: 'local.netease.com',
    port: 7007,
    https: {
      key: path.resolve(__dirname, 'local.netease.com-key.pem'),
      cert: path.resolve(__dirname, 'local.netease.com.pem'),
    },
    headers: { 'Origin-Agent-Cluster': '?0' },
  },
  targets: {
    chrome: 79,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
  alias: {
    '@music163/tango-helpers': resolvePackageIndex('helpers/src/index.ts'),
    '@music163/tango-core': resolvePackageIndex('core/src/index.ts'),
    '@music163/tango-context': resolvePackageIndex('context/src/index.ts'),
    '@music163/tango-ui': resolvePackageIndex('ui/src/index.ts'),
    '@music163/tango-designer': resolvePackageIndex('designer/src/index.ts'),
    '@music163/tango-sandbox': resolvePackageIndex('sandbox/src/index.ts'),
    '@music163/tango-setting-form': resolvePackageIndex('setting-form/src/index.ts'),
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'styled-components': 'styled',
    moment: 'moment',
    antd: 'antd',
  },
  chainWebpack: (config: any) => {
    // @see https://github.com/graphql/graphql-js/issues/1272#issuecomment-393903706
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include.add(/node_modules/)
      .end()
      .type('javascript/auto');
    config.module.rule('js').include.add(resolvePackageIndex('context/src'));
    config.module.rule('js').include.add(resolvePackageIndex('core/src'));
    config.module.rule('js').include.add(resolvePackageIndex('designer/src'));
    config.module.rule('js').include.add(resolvePackageIndex('helpers/src'));
    config.module.rule('js').include.add(resolvePackageIndex('sandbox/src'));
    config.module.rule('js').include.add(resolvePackageIndex('setting-form/src'));
    config.module.rule('js').include.add(resolvePackageIndex('ui/src'));
    return config;
  },
};
