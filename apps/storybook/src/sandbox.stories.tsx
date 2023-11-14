import React from 'react';
import { Box } from 'coral-system';
import { CodeSandbox } from '@music163/tango-sandbox';
import { JsonView } from '@music163/tango-ui';

export default {
  title: 'CodeSandbox',
};

const entryFilename = '/index.js';

const packageJson = {
  name: 'demo',
  private: true,
  main: entryFilename,
  dependencies: {
    react: '^17.0.1',
    'react-dom': '^17.0.1',
  },
};

const entryFile = `
import React from 'react';
import ReactDOM from "react-dom";
import App from './src';

const rootElement = document.getElementById("root");

ReactDOM.render(
  <App />,
  rootElement
);
`;

const srcAppFile = `
import React from 'react';

export default function App() {
  return <div style={{ background: 'yellow', color: 'red' }}>hello world</div>;
}
`;

const files = {
  '/package.json': {
    code: JSON.stringify(packageJson),
  },
  [entryFilename]: {
    code: entryFile,
  },
  '/src/index.js': { code: srcAppFile },
};

export function Basic() {
  return (
    <Box display="flex" height="100vh">
      <CodeSandbox
        template="create-react-app"
        bundlerURL="https://codesandbox.fn.netease.com"
        files={files}
        entry={entryFilename}
        style={{
          flex: 1,
        }}
      />
      <Box width="30%">
        <JsonView src={files} />
      </Box>
    </Box>
  );
}
