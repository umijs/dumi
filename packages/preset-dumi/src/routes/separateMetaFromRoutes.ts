import type { IRoute } from '@umijs/types';

export default (data: IRoute[]): { routes: IRoute[]; metas: Object; } => {
  const metas = {};
  const separate = (d) => {
    return d.map(i => {
      if (i.routes) {
        i.routes = separate(i.routes);
      }
      const { meta, ...other } = i;
      if (meta && i.path) {
        metas[i.path] = meta;
      }
      return other;
    })
  }
  const routes = separate(data);
  return {
    routes,
    metas
  }
}
