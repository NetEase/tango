import { IFiles, IDependencies } from '../types';

export function getPackageJSON(dependencies: IDependencies = {}, entry = '/index.js') {
  return JSON.stringify(
    {
      name: 'sandpack-project',
      main: entry,
      dependencies,
    },
    null,
    2,
  );
}

// 整理 files
// 如果 files 中没有 package.json 文件，则通过 dependencies 和 entry 动态生成 package.json 文件
export function createMissingPackageJSON(
  files: IFiles,
  dependencies?: IDependencies,
  entry?: string,
) {
  const newFiles = { ...files };

  if (!newFiles['/package.json']) {
    if (!dependencies) {
      throw new Error(
        'No dependencies specified, please specify either a package.json or dependencies.',
      );
    }

    if (!entry) {
      throw new Error(
        "No entry specified, please specify either a package.json with 'main' field or dependencies.",
      );
    }

    newFiles['/package.json'] = {
      code: getPackageJSON(dependencies, entry),
    };
  }

  return newFiles;
}

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

export function changeRoute(iframeEl: HTMLIFrameElement, path = '/', routerMode = 'history') {
  const _isSameOrigin = isSameOrigin(window.location.href, iframeEl.src);
  if (!_isSameOrigin) {
    console.warn('无法跨域设置 iframe 中的路由');
    return;
  }
  if (iframeEl) {
    try {
      if (routerMode === 'hash') {
        iframeEl.contentWindow.location.hash = path;
      } else {
        iframeEl.contentWindow.history.pushState({ key: '642dmeli', state: null }, null, path);
        const popevent = new PopStateEvent('popstate', { state: { key: '642dmeli' } });
        iframeEl.contentWindow.dispatchEvent(popevent);
      }
    } catch (e) {
      console.log(e, 'from changeStartRoute');
    }
  }
}
