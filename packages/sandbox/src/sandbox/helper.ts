import { IFiles } from '../types';

// 兼容 tango.config.json，转成 sandbox.config.json
export const enhanceFiles = (files: IFiles, entry = '/src/index.js') => {
  if (files['/tango.config.json']) {
    const tangConfigJsonStr = files['/tango.config.json'].code;
    const tangConfigJson = JSON.parse(tangConfigJsonStr);
    files['/sandbox.config.json'] = {
      code: JSON.stringify(tangConfigJson.sandbox, null, 2),
    };
  }

  if (!files['/index.html']) {
    files['/index.html'] = {
      code: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" href="data:image/ico;base64,aWNv">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Vite App</title>
          </head>
          <body>
            <div id="root" />
            <script type="module" src="${entry}"></script>
          </body>
        </html>
      `,
    };
  }

  return files;
};
