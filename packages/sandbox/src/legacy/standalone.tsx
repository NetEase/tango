import React, { useRef, useEffect } from 'react';

const style = {
  width: '100%',
  height: '100%',
};

export function StandaloneLegacySandbox({ workspace, customImportMap }: any) {
  const ref = useRef<HTMLIFrameElement>();

  useEffect(() => {
    if (ref.current) {
      ref.current.contentWindow['workspace'] = workspace;
      ref.current.contentWindow['customImportMap'] = customImportMap;
      ref.current.contentDocument.open();
      ref.current.contentDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Tango Sandbox</title>
          <link rel="stylesheet" href="https://unpkg.com/antd/dist/antd.css" />
          <script src="https://unpkg.com/react@16.14.0/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@16.14.0/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/moment/min/moment-with-locales.js"></script>
          <script src="https://unpkg.com/react-is@16/umd/react-is.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone@7.15.6/babel.js"></script>
          <script src="https://unpkg.com/styled-components@5.1.1/dist/styled-components.js"></script>
          <script src="https://unpkg.com/antd/dist/antd-with-locales.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/netease-sea@1.0.0/dist/index.min.js"></script>
          <script src="http://127.0.0.1:8081/assets/loader.js"></script>
          <script>
            seajs.customImportMap = window.customImportMap;
            seajs.use(['http://127.0.0.1:8081/src/index.js']);
          </script>
        </head>
        <body>
          <div id="sandbox-container"></div>
      `);
      ref.current.contentDocument.close();
    }
  }, [workspace, customImportMap]);

  return <iframe style={style} ref={ref} />;
}
