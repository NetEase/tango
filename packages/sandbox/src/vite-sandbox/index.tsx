import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TangoEventName } from '@music163/tango-helpers';
import Loading from './loading';
import { changeRoute } from './helper';
import { ViteSandboxProps, IFiles } from '../types';

const urlParams = new URLSearchParams(window.location.search);

const ViteSandbox = ({
  files = {},
  bundlerURL = '',
  eventHandlers = {},
  startRoute,
  routerMode,
  onLoad,
}: ViteSandboxProps) => {
  const [loading, setLoading] = useState(true);
  const iframeEl = useRef(null);

  const sendProjectInfo = useCallback((files: IFiles) => {
    iframeEl.current.contentWindow.postMessage(
      {
        type: 'compile-esm',
        payload: {
          files,
          busid: urlParams.get('sprintId') || '',
          wcid: urlParams.get('appId') || '',
        },
      },
      '*',
    );
  }, []);

  const sandboxOnLoad = useCallback(() => {
    // 修改 domain，以便让外部页面和 iframe 页面在同一个域名下，主要目的是为了直接监听 iframe 页面的事件
    document.domain = window.location.hostname.split('.').slice(-2).join('.');

    sendProjectInfo(files);
  }, [files, sendProjectInfo]);

  // 监听事件
  const attachEvent = useCallback(
    (document: Document) => {
      Object.keys(eventHandlers).forEach((eventType) => {
        document[eventType.toLowerCase()] = eventHandlers[eventType];
        if (eventType === 'onTango') {
          document?.addEventListener(TangoEventName.DesignerAction, eventHandlers[eventType]);
        }
      });
    },
    [eventHandlers],
  );

  const handleMessage = useCallback(
    ({ data }: any) => {
      switch (data.type) {
        case 'inner-sandbox-container-created':
          if (iframeEl.current.contentDocument) {
            const innerIframe = iframeEl.current.contentDocument.querySelector(
              '#inner-sandbox-container',
            ) as HTMLIFrameElement;

            if (innerIframe && innerIframe.contentDocument) {
              innerIframe.onload = () => {
                attachEvent(innerIframe.contentDocument);

                // 被构建应用的页面渲染成功后，设置初始路由
                changeRoute(iframeEl.current, startRoute, routerMode);

                // 被构建应用的页面渲染成功后，关闭 loading
                setLoading(false);

                // 被构建应用的页面渲染成功后，执行传入的回调函数
                onLoad && onLoad();
              };
            }
          }
          break;
        default:
          break;
      }
    },
    [attachEvent, startRoute, routerMode, onLoad],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  useEffect(() => {
    sendProjectInfo(files);
  }, [files, sendProjectInfo]);

  useEffect(() => {
    changeRoute(iframeEl.current, startRoute, routerMode);
  }, [startRoute, routerMode]);

  return (
    <>
      {loading ? <Loading /> : null}
      <iframe
        ref={iframeEl}
        id="sandbox-container"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          outline: 0,
        }}
        src={bundlerURL}
        onLoad={sandboxOnLoad}
      />
    </>
  );
};

export default ViteSandbox;
