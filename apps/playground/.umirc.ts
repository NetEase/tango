import path from 'path';
import { defineConfig } from 'umi';

const resolvePackageIndex = (relativeEntry: string) =>
  path.resolve(__dirname, '../../packages/', relativeEntry);

export default defineConfig({
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  npmClient: 'yarn',
  mfsu: false,
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
  headScripts: [
    'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js',
    'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js',
    'https://cdn.jsdelivr.net/npm/react-is@18.2.0/umd/react-is.production.min.js',
    'https://cdn.jsdelivr.net/npm/moment/min/moment-with-locales.js',
    'https://cdn.jsdelivr.net/npm/styled-components@5.3.11/dist/styled-components.js',
    'https://cdn.jsdelivr.net/npm/antd@4.24.13/dist/antd-with-locales.min.js',
    'https://cdn.jsdelivr.net/npm/prettier@2.6.0/standalone.js',
    'https://cdn.jsdelivr.net/npm/prettier@2.6.0/parser-babel.js',
  ],
  https: {
    key: path.resolve(__dirname, 'local.netease.com-key.pem'),
    cert: path.resolve(__dirname, 'local.netease.com.pem'),
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
  monorepoRedirect: {},
});
