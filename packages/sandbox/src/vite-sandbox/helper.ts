import MD5 from 'crypto-js/md5';

function isSameOrigin(url1: string, url2: string) {
  try {
    const u1 = new URL(url1);
    const u2 = new URL(url2);
    return (
      u1.protocol === u2.protocol &&
      u1.hostname.split('.').slice(-2).join('.') === u2.hostname.split('.').slice(-2).join('.')
    );
  } catch (e) {
    console.log(e, 'from isSameOrigin');
    return false;
  }
}

export const getBaseName = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const busid = MD5(JSON.stringify(urlParams.get('sprintId') || '')).toString();
  const wcid = MD5(JSON.stringify(urlParams.get('appId') || '')).toString();
  return `/${busid}/vite/${wcid}`;
};

export function changeRoute(iframeEl: HTMLIFrameElement, path = '/', routerMode = 'history') {
  const basename = getBaseName();
  const _isSameOrigin = isSameOrigin(window.location.href, iframeEl.src);
  if (!_isSameOrigin) {
    console.log('无法跨域设置 iframe 中的路由');
    return;
  }

  if (iframeEl.contentDocument) {
    const innerIframe = iframeEl.contentDocument.querySelector(
      '#inner-sandbox-container',
    ) as HTMLIFrameElement;

    if (innerIframe) {
      try {
        if (routerMode === 'hash') {
          innerIframe.contentWindow.location.hash = basename + path;
        } else {
          innerIframe.contentWindow.history.pushState(
            { key: '642dmeli', state: null },
            null,
            basename + path,
          );
          const popevent = new PopStateEvent('popstate', { state: { key: '642dmeli' } });
          innerIframe.contentWindow.dispatchEvent(popevent);
        }
      } catch (e) {
        console.log(e, 'from changeStartRoute');
      }
    }
  }
}
