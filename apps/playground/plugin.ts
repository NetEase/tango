import type { IApi } from 'umi';

export default (api: IApi) => {
  api.addMiddlewares(() => {
    return (req, res, next) => {
      res.setHeader('Origin-Agent-Cluster', '?0');
      next();
    };
  });
};
