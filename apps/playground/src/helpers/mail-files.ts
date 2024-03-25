const packageJson = {
  name: 'demo',
  private: true,
  dependencies: {
    '@music163/tango-mail': '0.1.1',
    '@music163/tango-boot': '0.2.5',
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
    '@music163/tango-boot': {
      description: '云音乐低代码运行时框架',
      version: '0.2.5',
      library: 'TangoBoot',
      type: 'baseDependency',
      resources: ['https://unpkg.com/@music163/tango-boot@{{version}}/dist/boot.js'],
      // resources: ['http://localhost:9001/boot.js'],
    },
    '@music163/tango-mail': {
      description: 'TangoMail 基础物料',
      version: '0.1.1',
      library: 'TangoMail',
      type: 'baseDependency',
      resources: ['https://unpkg.com/@music163/tango-mail@{{version}}/dist/index.js'],
      designerResources: ['https://unpkg.com/@music163/tango-mail@{{version}}/dist/designer.js'],
    },
  },
};

const routesCode = `
import Mail from "./pages/mail";

const routes = [
  {
    path: '/',
    exact: true,
    component: Mail,
  },
];

export default routes;
`;

const entryCode = `
import { runApp } from '@music163/tango-boot';
import routes from './routes';

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

const viewHomeCode = `
import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@music163/tango-mail';

const WelcomeEmail = () => (
  <Html>
    <Head />
    <Preview>The sales intelligence platform that helps you uncover qualified leads.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hi wells,</Text>
        <Text style={paragraph}>
          Welcome to Koala, the sales intelligence platform that helps you uncover qualified leads
          and close deals faster.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href="https://getkoala.com">
            Get started
          </Button>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />
          The Koala team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>470 Noor Ave STE B #1148, South San Francisco, CA 94080</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center',
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'block',
  padding: '12px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};

export default WelcomeEmail;
`;

export const mailFiles = [
  { filename: '/package.json', code: JSON.stringify(packageJson) },
  { filename: '/tango.config.json', code: JSON.stringify(tangoConfigJson) },
  { filename: '/README.md', code: '# readme' },
  { filename: '/src/index.js', code: entryCode },
  { filename: '/src/pages/mail.js', code: viewHomeCode },
  { filename: '/src/routes.js', code: routesCode },
];
