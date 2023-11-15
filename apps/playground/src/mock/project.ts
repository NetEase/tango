const packageJson = {
  name: 'demo',
  private: true,
  dependencies: {
    '@music163/antd': '0.1.6',
    '@music163/tango-boot': '0.1.3',
    react: '17.0.2',
    'react-dom': '17.0.2',
    'prop-types': '15.7.2',
    tslib: '2.5.0',
  },
};

const tangoConfigJson = {
  packages: {
    react: {
      version: '17.0.2',
      library: 'React',
      type: 'dependency',
      resources: ['https://cdn.jsdelivr.net/npm/react@{{version}}/umd/react.development.js'],
    },
    'react-dom': {
      version: '17.0.2',
      library: 'ReactDOM',
      type: 'dependency',
      resources: [
        'https://cdn.jsdelivr.net/npm/react-dom@{{version}}/umd/react-dom.development.js',
      ],
    },
    'react-is': {
      version: '16.13.1',
      library: 'ReactIs',
      type: 'dependency',
      resources: [
        'https://cdn.jsdelivr.net/npm/react-is@{{version}}/umd/react-is.production.min.js',
      ],
    },
    'styled-components': {
      version: '5.3.5',
      library: 'styled',
      type: 'dependency',
      resources: [
        'https://cdn.jsdelivr.net/npm/styled-components@{{version}}/dist/styled-components.min.js',
      ],
    },
    moment: {
      version: '2.29.4',
      library: 'moment',
      type: 'dependency',
      resources: ['https://cdn.jsdelivr.net/npm/moment@{{version}}/moment.js'],
    },
    '@music163/tango-boot': {
      version: '0.2.1',
      library: 'TangoBoot',
      type: 'baseDependency',
      resources: ['https://cdn.jsdelivr.net/npm/@music163/tango-boot@{{version}}/dist/boot.js'],
      // resources: ['http://localhost:9001/boot.js'],
      description: '云音乐低代码运行时框架',
    },
    '@music163/antd': {
      version: '0.1.7',
      library: 'TangoAntd',
      type: 'baseDependency',
      resources: [
        'https://cdn.jsdelivr.net/npm/@music163/antd@{{version}}/dist/index.js',
        'https://cdn.jsdelivr.net/npm/antd@4.24.13/dist/antd.css',
      ],
      description: '云音乐低代码中后台应用基础物料',
      designerResources: [
        'https://cdn.jsdelivr.net/npm/@music163/antd@{{version}}/dist/designer.js',
        // 'http://localhost:9002/designer.js',
        'https://cdn.jsdelivr.net/npm/antd@4.24.13/dist/antd.css',
      ],
    },
  },
};

const appJson: any = {
  pages: [
    {
      path: '/',
      name: '首页',
    },
  ],
};

const routesCode = `
import Index from "./pages/list";

const routes = [
  {
    path: '/',
    exact: true,
    component: Index
  },
];

export default routes;
`;

const storeIndexCode = `
export { default as app } from './app';
export { default as counter } from './counter';
`;

const entryCode = `
import { runApp } from '@music163/tango-boot';
import routes from './routes';
import './services';
import './stores';
import './index.less';

runApp({
  boot: {
    mountElement: document.querySelector('#root'),
    qiankun: false,
  },

  router: {
    type: 'browser',
    config: routes,
  },
});
`;

const storeCounter = `
import { defineStore } from '@music163/tango-boot';

const counter = defineStore({
  // state
  num: 0,

  // action
  increment: () => counter.num++,

  decrement: () => {
    counter.num--;
  },
}, 'counter');

export default counter;
`;

const viewHomeCode = `
import React from "react";
import { definePage } from "@music163/tango-boot";
import {
  Page,
  Section,
  Button,
  Input,
  FormilyForm,
} from "@music163/antd";
class App extends React.Component {
  render() {
    return (
      <Page title={tango.stores.app.title}>
       <Section title="Section Title">
       </Section>
       <Section>
          <Button>button</Button>
          <Input />
        </Section>
      </Page>
    );
  }
}
export default definePage(App);
`;

const storeApp = `
import { defineStore } from '@music163/tango-boot';

export default defineStore({

  title: 'Page Title',

  array: [1, 2, 3],
}, 'app');
`;

const serviceCode = `
import { defineServices } from '@music163/tango-boot';
import './sub';

export default defineServices({
  get: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/cc974ffbaa7a85c77f30e4ce67deb67f/api/getUserProfile',
    formatter: res => res.data,
    headers: {
      'Content-Type': 'application/json',
    }
  },
  list: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/c45109399a1d33d83e32a59984b25b00/anchor-list-normal',
  },
  add: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/c45109399a1d33d83e32a59984b25b00/api/users',
    method: 'post',
  },
  update: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/c45109399a1d33d83e32a59984b25b00/api/users',
    method: 'post',
  },
  delete: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/c45109399a1d33d83e32a59984b25b00/api/users?id=1',
  },
});
`;

const subServiceCode = `
import { defineServices } from '@music163/tango-boot';

export default defineServices({
  list: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/c45109399a1d33d83e32a59984b25b00/anchor-list-normal',
  },
}, {
  namespace: 'sub',
});
`;

const lessCode = `
body {
  font-size: 12px;
}
`;

const cssCode = `
* {
  margin: 0;
  padding: 0;
}

p {
  color: red;
}
`;

export const sampleFiles = [
  { filename: '/package.json', code: JSON.stringify(packageJson) },
  { filename: '/appJson.json', code: JSON.stringify(appJson) },
  { filename: '/tango.config.json', code: JSON.stringify(tangoConfigJson) },
  { filename: '/README.md', code: '# readme' },
  { filename: '/src/index.less', code: lessCode },
  { filename: '/src/style.css', code: cssCode },
  { filename: '/src/index.js', code: entryCode },
  { filename: '/src/pages/list.js', code: viewHomeCode },
  { filename: '/src/routes.js', code: routesCode },
  { filename: '/src/stores/index.js', code: storeIndexCode },
  { filename: '/src/stores/app.js', code: storeApp },
  { filename: '/src/stores/counter.js', code: storeCounter },
  { filename: '/src/services/index.js', code: serviceCode },
  { filename: '/src/services/sub.js', code: subServiceCode },
  { filename: '/src/utils/index.js', code: `export function foo() {}` },
];

export const genDefaultPage = (index: number) => ({
  name: 'new-page',
  code: `
  import React from 'react';
  import tango, { definePage } from '@music163/tango-boot';
  import { Page, Section } from '@music163/antd';

  function App() {
    return (
      <Page title="空白模板${index}">
        <Section></Section>
      </Page>
    )
  }

  export default definePage(App);
  `,
});
