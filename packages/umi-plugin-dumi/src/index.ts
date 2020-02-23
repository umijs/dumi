import fs from 'fs';
import path from 'path';
import { IApi, IRoute } from '@umijs/types';
import symlink from 'symlink-dir';
import hostedGit from 'hosted-git-info';
import getRouteConfig from './routes/getRouteConfig';
import getNavFromRoutes from './routes/getNavFromRoutes';
import getMenuFromRoutes from './routes/getMenuFromRoutes';
import getLocaleFromRoutes from './routes/getLocaleFromRoutes';
import getHostPkgAlias from './utils/getHostPkgAlias';
import { setUserExtraBabelPlugin } from './transformer/demo';

export interface IDumiOpts {
  title?: string;
  logo?: string;
  mode?: 'doc' | 'site';
  desc?: string;
  include?: string[];
  locales?: [string, string][];
  routes?: {
    path: IRoute['path'];
    component: IRoute['component'];
    redirect: IRoute['redirect'];
    [key: string]: any;
  }[];
}

export default function(api: IApi, opts: IDumiOpts) {
  // apply default options
  const pkg = require(path.join(api.paths.cwd, 'package.json'));
  const defaultTitle = pkg.name || 'dumi';
  const hostPkgAlias = getHostPkgAlias(api.paths);

  opts = Object.assign(
    {
      title: defaultTitle,
      // default to include src, lerna pkg's src & docs folder
      include: hostPkgAlias.map(([_, pkgPath]) => path.join(pkgPath, 'src')).concat(['docs']),
      routes: api.userConfig.routes,
      locales: [
        ['en-US', 'EN'],
        ['zh-CN', '中文'],
      ],
      mode: 'doc',
    },
    (api.userConfig as any).doc,
    opts,
  );

  // register doc config on umi system config
  api.describe({
    key: 'doc',
    config: {
      default: {
        title: defaultTitle,
        // default to include src, lerna pkg's src & docs folder
        include: hostPkgAlias.map(([_, pkgPath]) => path.join(pkgPath, 'src')).concat(['docs']),
        locales: [
          ['en-US', 'EN'],
          ['zh-CN', '中文'],
        ],
        mode: 'doc',
      },
      schema(joi) {
        return joi.object();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // repalce default routes with generated routes
  api.modifyRoutes(routes => {
    const result = getRouteConfig(api, opts);
    const childRoutes = result[0].routes;
    const meta = {
      menus: getMenuFromRoutes(childRoutes, opts),
      locales: getLocaleFromRoutes(childRoutes, opts),
      navs: getNavFromRoutes(childRoutes, opts),
      title: opts.title,
      logo: opts.logo,
      desc: opts.desc,
      mode: opts.mode,
      repoUrl: hostedGit.fromUrl(pkg.repository?.url || pkg.repository)?.browse(),
    };

    // append umi NotFound component to routes
    childRoutes.push(...routes.filter(({ path: routerPath }) => !routerPath));

    // pass props for layout
    result[0].component = `(props) => require('react').createElement(require('${
      result[0].component
    }').default, {
      ...${
        // escape " to ^ to avoid umi parse error, then umi will decode them
        // see also: https://github.com/umijs/umi/blob/master/packages/umi-build-dev/src/routes/stripJSONQuote.js#L4
        JSON.stringify(meta).replace(/"/g, '^')
      },
      ...props,
    })`;

    return result;
  });

  // exclude .md file for url-loader
  api.modifyDefaultConfig(config => ({
    ...config,
    urlLoaderExcludes: [/\.md$/],
    // pass empty routes if pages path does not exist and no routes config
    // to avoid umi throw src directory not exists error
    routes: fs.existsSync(api.paths.absPagesPath) && !api.userConfig.routes ? undefined : [],
  }));

  // configure loader for .md file
  api.chainWebpack(config => {
    config.module
      .rule('md')
      .test(/\.md$/)
      .use('dumi')
      .loader(require.resolve('./loader'));

    // add alias for current package(s)
    hostPkgAlias
      .filter(([pkgName]) => pkgName)
      .forEach(([pkgName, pkgPath]) => {
        const srcPath = path.join(pkgPath, 'src');
        const linkPath = path.join(api.paths.cwd, 'node_modules', pkgName);

        // use src path instead of main field in package.json if exists
        if (fs.existsSync(srcPath)) {
          // exclude lib folder
          config.resolve.alias.set(`${pkgName}/es`, `${pkgPath}/es`);
          config.resolve.alias.set(`${pkgName}/lib`, `${pkgPath}/lib`);
          config.resolve.alias.set(pkgName, srcPath);
        } else {
          config.resolve.alias.set(pkgName, pkgPath);
        }

        // link current pkgs into node_modules, for import module resolve when writing demo
        if (!fs.existsSync(linkPath)) {
          symlink(pkgPath, linkPath);
        }
      });

    return config;
  });

  // watch .md files
  api.addTmpGenerateWatcherPaths(() => [
    ...opts.include.map(key => path.join(api.paths.cwd, key, '**/*.md')),
  ]);

  // sync user extra babel plugins for demo transformer
  if (api.userConfig.extraBabelPlugins) {
    setUserExtraBabelPlugin(api.userConfig.extraBabelPlugins);
  }

  // TODO: CLI help info
  // TODO: site title support for routes
}
