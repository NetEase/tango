import { builtinWorkspace as workspace } from '@music163/tango-core';
import { logger, noop } from '@music163/tango-helpers';
import { code2browser } from './helpers';

// @ts-ignore
const seajs = window.seajs || {
  on(event: string, callback: any) {},
};

const resolve = seajs.resolve;

seajs.resolve = (id: string, refUri: string) => {
  const importMap = seajs.customImportMap || {};
  if (id in importMap) {
    return id;
  }

  // custom resolve
  if (seajs.customResolve) {
    const ret = seajs.customResolve(id, refUri);
    if (ret) {
      return ret;
    }
  }

  // 为了解决类似 xxx/xxxx/variables 这类问题，还需判断是否 lib 目录下的
  // let index: number;
  // const ret = Object.keys(resolved).some((key, i) => {
  //   if (id.indexOf(key) === 0 && id.replace(key, '').charAt(0) === '/' && id.replace(key, '').split('/')[1] === 'lib') {
  //     index = i;
  //     return true;
  //   }
  //   return false;
  // });

  // if (ret) {
  //   return Object.keys(resolved)[index];
  // }

  return resolve(id, refUri);
};

const request = seajs.request;

seajs.parseFilename = (url: string): string => {
  const uri = new URL(url);
  const filename = uri.pathname;
  return filename;
};

seajs.customFetch = (url: string) => {
  return fetch(url).then((res) => res.text());
};

seajs.request = (url: string, callback: () => any = noop) => {
  // url = url.replace(/\.jsx\.js$/, '.jsx');
  // url = url.replace(/\.json\.js$/, '.json');

  // 先忽略掉样式
  if (/\.scss\.js$|\.sass\.js$|\.less\.js$|\.css\.js$/.exec(url)) return callback();

  // 先忽略掉没有版本号的包，这个一般是node包
  // if (ignoreNoVersonPackage(url)) return callback();

  const fileName = seajs.parseFilename(url);

  let ret;
  // TODO: 这里混入了 loader 的逻辑中，需要一个更好的方式去判断，能否在往外放
  if (workspace.getFile(fileName)) {
    ret = new Promise((resolve, reject) => {
      resolve(workspace.getFile(fileName).code);
    });
  } else {
    if (url.indexOf('materiels') > -1) {
      if (/\.json/.test(url)) {
        ret = fetch(`${url}?${Date.now()}`)
          .then((res) => {
            return res.text();
          })
          .then((content) => {
            const tpl = `seajsDefine("${url}", [], function (require, exports, module) {
            module.exports = ${content}
          })`;
            eval(tpl);
            callback();
          });
      } else {
        request(url, callback);
      }
      return;
    }
    ret = seajs.customFetch(url);
  }

  ret
    .then((source: string) => {
      logger.group(`load from remote: ${fileName}`, source);
      return source as string;
    })
    .then((source: string) => {
      workspace.addFile(fileName, source);
      return workspace.getFile(fileName).code;
    })
    // 正式的渲染流程
    .then((source: string) => {
      return code2browser(source, { fileName });
    })
    .then((source: string) => {
      return `
      seajsDefine("${url}", function (require, exports, module) {
          ${source}
        })
      `.trim();
    })
    .then((source: string) => {
      // TODO: 渲染错误时，应该提供 Error Placeholder，或者直接做在沙箱里
      try {
        eval(source);
        callback();
      } catch (err) {
        logger.error('渲染出错啦，请检查代码语法', err);
      }
    });
};

seajs.on('request', (data: any) => {
  const importMap = seajs.customImportMap || {};
  const uri = data.uri;
  if (importMap[uri]) {
    const def = new Function(
      'uri',
      'ret',
      `
      seajsDefine(uri, function(require, exports, module) {
          module.exports = ret;
        })
      `,
    );
    def(uri, importMap[uri]);
    data.onRequest();
    data.requested = true;
  }
});
