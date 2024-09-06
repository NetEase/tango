const packageJson = {
  name: 'demo',
  private: true,
  dependencies: {
    '@music163/antd': '0.2.5',
    '@music163/tango-boot': '0.3.5',
    react: '17.0.2',
    'react-dom': '17.0.2',
    'prop-types': '15.7.2',
    tslib: '2.5.0',
  },
};

const tangoConfigJson = {
  designerConfig: {
    autoGenerateComponentId: true,
  },
  packages: {
    react: {
      version: '17.0.2',
      library: 'React',
      type: 'dependency',
      resources: ['https://unpkg.com/react@{{version}}/umd/react.development.js'],
    },
    'react-dom': {
      version: '17.0.2',
      library: 'ReactDOM',
      type: 'dependency',
      resources: ['https://unpkg.com/react-dom@{{version}}/umd/react-dom.development.js'],
    },
    'react-is': {
      version: '16.13.1',
      library: 'ReactIs',
      type: 'dependency',
      resources: ['https://unpkg.com/react-is@{{version}}/umd/react-is.production.min.js'],
    },
    'styled-components': {
      version: '5.3.5',
      library: 'styled',
      type: 'dependency',
      resources: ['https://unpkg.com/styled-components@{{version}}/dist/styled-components.min.js'],
    },
    moment: {
      version: '2.29.4',
      library: 'moment',
      type: 'dependency',
      resources: ['https://unpkg.com/moment@{{version}}/moment.js'],
    },
    '@music163/tango-boot': {
      description: '云音乐低代码运行时框架',
      version: '0.3.5',
      library: 'TangoBoot',
      type: 'baseDependency',
      resources: ['https://unpkg.com/@music163/tango-boot@{{version}}/dist/boot.js'],
      // resources: ['http://localhost:9001/boot.js'],
    },
    '@music163/antd': {
      description: '云音乐低代码中后台应用基础物料',
      version: '0.2.6',
      library: 'TangoAntd',
      type: 'baseDependency',
      resources: [
        'https://unpkg.com/@music163/antd@{{version}}/dist/index.js',
        // 'http://localhost:9002/designer.js',
        'https://unpkg.com/antd@4.24.13/dist/antd.css',
      ],
      designerResources: [
        'https://unpkg.com/@music163/antd@{{version}}/dist/designer.js',
        'https://unpkg.com/antd@4.24.13/dist/antd.css',
      ],
    },
  },
};

const helperCode = `
export function registerComponentPrototype(proto) {
  if (!proto) return;
  if (!window.localTangoComponentPrototypes) {
    window.localTangoComponentPrototypes = {};
  }
  if (proto.name) {
    window.localTangoComponentPrototypes[proto.name] = proto;
  }
}
`;

const routesCode = `
import Index from "./pages/list";
import Detail from "./pages/detail";

const routes = [
  {
    path: '/',
    exact: true,
    component: Index
  },
  {
    path: '/detail',
    exact: true,
    component: Detail
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
  Box,
  Button,
  Input,
  FormilyForm,
  FormilyFormItem,
  Table,
} from "@music163/antd";
import { Space } from "@music163/antd";
import { LocalButton } from "../components";
import { OutButton } from "../components";

class App extends React.Component {
  render() {
    return (
      <Page title={tango.stores.app.title} subTitle={<><Button>hello</Button></>}>
        <Section tid="section0">
          <Box></Box>
        </Section>
        <Section tid="section1" title="Section Title">
          your input: <Input tid="input1" defaultValue="hello" />
          copy input: <Input value={tango.page.input1?.value} />
          <Table
          columns={[
            { title: "姓名", dataIndex: "name", key: "name" },
            { title: "年龄", dataIndex: "age", key: "age" },
            { title: "住址", dataIndex: "address", key: "address" },
          ]}
          tid="table1"
        />
        </Section>
        <Section tid="section2">
          <Space tid="space1">
            <LocalButton />
            <OutButton />
            <Button tid="button1">button</Button>
          </Space>
        </Section>
        <Section title="区块标题" tid="section3">
          <FormilyForm tid="formilyForm1">
            <FormilyFormItem name="input1" component="Input" label="表单项" />
            <FormilyFormItem name="select1" component="Select" label="表单项" />
          </FormilyForm>
        </Section>
        <Section title="原生 DOM" tid="section4">
          <h1 style={{ ...{ color: "red" }, fontSize: 64 }}>
            hello world
          </h1>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f4f4f4",
            }}
          >
            <form onSubmit={tango.stores.app.submitForm} style={{
              padding: "10px",
            }}>
              <div>
                <label>Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  style={{ margin: "5px" }}
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  style={{ margin: "5px" }}
                />
              </div>
              <div>
                <label>Role:</label>
                <select id="role" name="role" style={{ margin: "5px" }}>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  style={{
                    marginTop: '5px',
                    padding: "3px 10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </Section>
      </Page>
    );
  }
}
export default definePage(App);
`;

export const emptyPageCode = `
import React from "react";
import { definePage } from "@music163/tango-boot";
import {
  Page,
  Section,
} from "@music163/antd";

function App() {
  return (<Page title="Detail Page">
    <Section></Section>
  </Page>)
}

export default definePage(App);
`;

const componentsButtonCode = `
import React from 'react';
import { registerComponentPrototype } from '../utils';

export default function MyButton(props) {
  return <button {...props}>my button</button>
}

registerComponentPrototype({
  name: 'LocalButton',
  title: 'Local Button',
  exportType: 'namedExport',
  package: '/src/components',
  props: [
    { name: 'background', title: '背景色', setter: 'colorSetter'  },
  ],
});
`;

const outButtonCode = `
import React from 'react';

export default function OutButton(props) {
  return <button {...props}>Out button (from other file)</button>
}
`;

const componentsInputCode = `
import React from 'react';
import { registerComponentPrototype } from '../utils';

export default function MyInput(props) {
  return <input {...props} />;
}

registerComponentPrototype({
  name: 'LocalInput',
  title: 'Local Input',
  exportType: 'namedExport',
  package: '/src/components',
  props: [
    { name: 'color', title: '文本色', setter: 'colorSetter'  },
  ],
});
`;

const componentsEntryCode = `
export { default as LocalButton } from './button';
export { default as LocalInput } from './input';
export { default as OutButton } from './out-button';
`;

const storeApp = `
import { defineStore } from '@music163/tango-boot';

export default defineStore({
  title: 'Page Title',

  array: [1, 2, 3],

  test: function() {
    console.log('test');
  },

  submitForm: function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("password");
    const role = formData.get("role");
    console.log("Submitted Data:", { username, password, role });
  }
}, 'app');
`;

const serviceCode = `
import { defineServices } from '@music163/tango-boot';
import './sub';

export default defineServices({
  longLongLongLongLongLongLongLongGet: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/cc974ffbaa7a85c77f30e4ce67deb67f/api/getUserProfile',
    formatter: res => res.data,
    headers: {
      'Content-Type': 'application/json',
    }
  },
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
    description: '新增用户'
  },
  update: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/c45109399a1d33d83e32a59984b25b00/api/users',
    method: 'post',
    description: '更新用户'
  },
  delete: {
    url: 'https://nei.hz.netease.com/api/apimock-v2/c45109399a1d33d83e32a59984b25b00/api/users?id=1',
    description: '删除用户'
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
  { filename: '/tango.config.json', code: JSON.stringify(tangoConfigJson) },
  { filename: '/README.md', code: '# readme' },
  { filename: '/src/index.less', code: lessCode },
  { filename: '/src/style.css', code: cssCode },
  { filename: '/src/index.js', code: entryCode },
  { filename: '/src/pages/list.js', code: viewHomeCode },
  { filename: '/src/pages/detail.js', code: emptyPageCode },
  { filename: '/src/components/button.js', code: componentsButtonCode },
  { filename: '/src/components/out-button.js', code: outButtonCode },
  { filename: '/src/components/input.js', code: componentsInputCode },
  { filename: '/src/components/index.js', code: componentsEntryCode },
  { filename: '/src/routes.js', code: routesCode },
  { filename: '/src/stores/index.js', code: storeIndexCode },
  { filename: '/src/stores/app.js', code: storeApp },
  { filename: '/src/stores/counter.js', code: storeCounter },
  { filename: '/src/services/index.js', code: serviceCode },
  { filename: '/src/services/sub.js', code: subServiceCode },
  { filename: '/src/utils/index.js', code: helperCode },
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
