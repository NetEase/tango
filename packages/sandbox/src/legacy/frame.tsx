import React, { useContext } from 'react';
import ReactFrame, { FrameContext } from 'react-frame-component';
import { StyleSheetManager } from 'styled-components';

const template = `<html>
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
    <script src="https://unpkg.com/styled-components@5.3.3/dist/styled-components.js"></script>
    <script src="https://unpkg.com/antd/dist/antd-with-locales.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/netease-sea@1.0.0/dist/index.min.js"></script>
    <script src="http://127.0.0.1:8081/assets/loader.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

export function Frame({ children, ...rest }: React.ComponentPropsWithoutRef<'iframe'>) {
  return (
    <ReactFrame initialContent={template} mountTarget="#root" {...rest}>
      <InjectFrameStyles>{children}</InjectFrameStyles>
    </ReactFrame>
  );
}

export function useFrame() {
  const frame = useContext(FrameContext);
  return frame;
}

const InjectFrameStyles = (props: any) => {
  const { document } = useContext(FrameContext);
  return (
    <StyleSheetManager target={document.head}>
      <>{props.children}</>
    </StyleSheetManager>
  );
};
