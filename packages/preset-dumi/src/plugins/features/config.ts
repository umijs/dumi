import { IApi } from '@umijs/types';
import getLocaleFromRoutes from '../../routes/getLocaleFromRoutes';
import getMenuFromRoutes from '../../routes/getMenuFromRoutes';
import getNavFromRoutes from '../../routes/getNavFromRoutes';
import getRepoUrl from '../../utils/getRepoUrl';
import ctx from '../../context';

/**
 * plugin for generate dumi config into .umi temp directory
 */
export default (api: IApi) => {
  // write config.json when generating temp files
  api.onGenerateFiles(async () => {
    const root = (await api.getRoutes()).find(route => route._dumiRoot);
    const childRoutes = root.routes;
    const config = {
      menus: getMenuFromRoutes(childRoutes, ctx.opts, api.paths),
      locales: getLocaleFromRoutes(childRoutes, ctx.opts),
      navs: getNavFromRoutes(childRoutes, ctx.opts, ctx.opts.navs),
      title: ctx.opts.title,
      logo: ctx.opts.logo,
      desc: ctx.opts.description,
      mode: ctx.opts.mode,
      repository: {
        url: getRepoUrl(api.pkg.repository?.url || api.pkg.repository),
        branch: api.pkg.repository?.branch || 'master',
      },
      algolia: ctx.opts.algolia,
    };

    api.writeTmpFile({
      path: 'dumi/config.json',
      content: JSON.stringify(config, null, 2),
    });
  });
};
