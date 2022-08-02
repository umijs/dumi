import type { IApi } from '@umijs/types';
import getLocaleFromRoutes from '../../routes/getLocaleFromRoutes';
import getMenuFromRoutes from '../../routes/getMenuFromRoutes';
import getNavFromRoutes from '../../routes/getNavFromRoutes';
import getRepoUrl from '../../utils/getRepoUrl';
import type { IThemeContext } from '../../theme/context';
import ctx from '../../context';

/**
 * plugin for generate dumi config into .umi temp directory
 */
export default (api: IApi) => {
  // write config.json when generating temp files
  api.onGenerateFiles(async () => {
    const { routes } = await api.applyPlugins({
      key: 'dumi.getRootRoute',
      type: api.ApplyPluginsType.modify,
      initialValue: await api.getRoutes(),
    });
    const config: IThemeContext['config'] = {
      menus: getMenuFromRoutes(routes, ctx.opts, api.paths),
      locales: getLocaleFromRoutes(routes, ctx.opts),
      navs: getNavFromRoutes(routes, ctx.opts, ctx.opts.navs),
      title: ctx.opts.title,
      logo: ctx.opts.logo,
      description: ctx.opts.description,
      mode: ctx.opts.mode,
      repository: {
        url: getRepoUrl(
          api.pkg.repository?.url || api.pkg.repository,
          api.pkg.repository?.platform,
        ),
        branch: api.pkg.repository?.branch || 'master',
        platform: api.pkg.repository?.platform,
      },
      algolia: ctx.opts.algolia,
      theme: ctx.opts.theme,
      exportStatic: api.config.exportStatic,
    };

    api.writeTmpFile({
      path: 'dumi/config.json',
      content: JSON.stringify(config, null, 2),
    });
  });
};
