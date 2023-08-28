import React from 'react';
import { Box } from 'coral-system';
import { SingleMonacoEditor } from '@music163/tango-ui';

export default {
  title: 'Editor',
};

const code = `
import React from 'react';
import { definePage } from '@music163/tango-boot';
import { Layout, Page, Section, Button } from '@music163/antd';

function About(props) {
  const { stores } = props;

  const increment = () => {
    stores.counter.increment();
  };

  return (
    <Layout>
      <Page title="About Page" height="100vh">
        <Section>
          <h1>Counter: {stores.counter.num}</h1>
          <Button type="primary" onClick={increment}>
            +1
          </Button>
          <p>原生html元素不可拖拽</p>
        </Section>
      </Page>
    </Layout>
  );
}

export default definePage(About);
`;

export function Basic() {
  return (
    <Box border="solid" borderColor="line.normal" height="400px">
      <SingleMonacoEditor defaultValue={code} height="100%" onBlur={console.log} />
    </Box>
  );
}
