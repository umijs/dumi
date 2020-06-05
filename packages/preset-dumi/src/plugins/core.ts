import fs from 'fs';
import path from 'path';
import { IApi } from '@umijs/types';
import symlink from 'symlink-dir';
import getRouteConfig from '../routes/getRouteConfig';
import getNavFromRoutes from '../routes/getNavFromRoutes';
import getMenuFromRoutes from '../routes/getMenuFromRoutes';
import getLocaleFromRoutes from '../routes/getLocaleFromRoutes';
import getHostPkgAlias from '../utils/getHostPkgAlias';
import getDemoRoutes from '../routes/getDemoRoutes';
import getRepoUrl from '../utils/getRepoUrl';
import ctx, { init as setContext } from '../context';
import { IDumiOpts } from '..';

function mergeUserConfig(defaultOpts: { [key: string]: any }, api: IApi): IDumiOpts {
  const result = Object.assign({}, defaultOpts);

  // has default value keys
  ['mode', 'title', 'locales'].forEach(key => {
    result[key] = api.config[key] || result[key];
  });

  // non-default values keys
  ['description', 'logo', 'menus', 'navs'].forEach(key => {
    if (api.config[key] !== undefined) {
      result[key] = api.config[key];
    }
  });

  // nested resolve keys
  ['includes', 'previewLangs', 'examples'].forEach(key => {
    if (api.config.resolve?.[key]) {
      result.resolve[key] = api.config.resolve[key];
    }
  });

  // use umi routes key
  if (api.userConfig.routes) {
    result.routes = api.userConfig.routes;
  }

  result.algolia = api.userConfig.algolia;

  return result;
}

export default function(api: IApi) {
  // apply default options
  let pkg;

  try {
    pkg = require(path.join(api.paths.cwd, 'package.json'));
  } catch (err) {
    pkg = {};
  }

  const defaultTitle = pkg.name || 'dumi';
  const hostPkgAlias = getHostPkgAlias(api.paths);
  const defaultOpts = {
    title: defaultTitle,
    resolve: {
      // default to include src, lerna pkg's src & docs folder
      includes: hostPkgAlias
        .map(([_, pkgPath]) => path.relative(api.paths.cwd, path.join(pkgPath, 'src')))
        .concat(['docs']),
      previewLangs: ['jsx', 'tsx'],
      examples: ['examples'],
    },
    locales: [
      ['en-US', 'English'],
      ['zh-CN', '中文'],
    ],
    mode: 'doc',
  };
  // save umi api & opts into context
  const updateContext = () => setContext(api, mergeUserConfig(defaultOpts, api));

  // initial context
  api.onStart(updateContext);

  // for update context when config change
  api.onGenerateFiles(updateContext);

  // repalce default routes with generated routes
  api.onPatchRoutesBefore(({ routes, parentRoute }) => {
    // only deal with the top level routes
    if (!parentRoute) {
      const result = getRouteConfig(api, ctx.opts);

      // clear original routes
      routes.splice(0, routes.length);

      // append single demo routes to top-level
      result.unshift(...getDemoRoutes(api.paths));

      // append new routes
      routes.push(...result);
    }
  });

  // remove useless /index.html from exportStatic feature
  api.onPatchRoutes(({ routes, parentRoute }) => {
    if (api.config.exportStatic && parentRoute?.path === '/') {
      const rootHtmlIndex = routes.findIndex(route => route.path === '/index.html');

      routes.splice(rootHtmlIndex, 1);
    }
  });

  // repalce default routes with generated routes
  api.modifyRoutes(routes => {
    const opts = mergeUserConfig(defaultOpts, api);
    const root = routes.find(route => route.path === '/');
    const childRoutes = root.routes;
    const meta = {
      menus: getMenuFromRoutes(childRoutes, opts, api.paths),
      locales: getLocaleFromRoutes(childRoutes, opts),
      navs: getNavFromRoutes(childRoutes, opts, opts.navs),
      title: opts.title,
      logo: opts.logo,
      desc: opts.description,
      mode: opts.mode,
      repoUrl: getRepoUrl(pkg.repository?.url || pkg.repository),
      algolia: opts.algolia,
    };

    // pass props for layout
    root.component = `(props) => require('react').createElement(require('${
      root.component
    }').default, {
      ...${
        // escape " to ^ to avoid umi parse error, then umi will decode them
        // see also: https://github.com/umijs/umi/blob/master/packages/umi-build-dev/src/routes/stripJSONQuote.js#L4
        JSON.stringify(meta).replace(/"/g, '^')
      },
      ...props,
    })`;

    return routes;
  });

  // exclude .md file for url-loader
  api.modifyDefaultConfig(config => ({
    ...config,
    urlLoaderExcludes: [/\.md$/],
    // pass empty routes if pages path does not exist and no routes config
    // to avoid umi throw src directory not exists error
    routes: fs.existsSync(api.paths.absSrcPath) && !api.userConfig.routes ? undefined : [],
  }));

  // configure loader for .md file
  api.chainWebpack(config => {
    const oPlainTextTest = config.module.rule('plaintext').get('test');
    const babelLoader = config.module
      .rule('js')
      .use('babel-loader')
      .entries();

    // remove md file test from umi
    if (oPlainTextTest?.source?.includes('md')) {
      config.module
        .rule('plaintext')
        .set(
          'test',
          new RegExp(oPlainTextTest.source.replace(/\|md|md\|/, ''), oPlainTextTest.flags),
        );
    }

    // add md file loader
    config.module
      .rule('dumi')
      .test(/\.md$/)
      .use('babel-loader')
      .loader(babelLoader.loader)
      .options(babelLoader.options)
      .end()
      .use('dumi-loader')
      .loader(require.resolve('../loader'))
      .options({ previewLangs: ctx.opts.resolve.previewLangs });

    // add alias for current package(s)
    hostPkgAlias
      .filter(([pkgName]) => pkgName)
      .forEach(([pkgName, pkgPath]) => {
        let srcModule;
        const srcPath = path.join(pkgPath, 'src');
        const linkPath = path.join(api.paths.cwd, 'node_modules', pkgName);

        try {
          srcModule = require(srcPath);
        } catch (err) {
          if (err.code !== 'MODULE_NOT_FOUND') {
            srcModule = true;
          }
        }

        // use src path instead of main field in package.json if exists
        if (srcModule) {
          // exclude es & lib folder
          if (!config.resolve.alias.has(`${pkgName}/es`)) {
            config.resolve.alias.set(`${pkgName}/es`, srcPath);
          }

          if (!config.resolve.alias.has(`${pkgName}/lib`)) {
            config.resolve.alias.set(`${pkgName}/lib`, srcPath);
          }

          if (!config.resolve.alias.has(pkgName)) {
            config.resolve.alias.set(pkgName, srcPath);
          }
        } else if (!config.resolve.alias.has(pkgName)) {
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
  api.addTmpGenerateWatcherPaths(() => {
    const opts = mergeUserConfig(defaultOpts, api);

    return [
      ...opts.resolve.includes.map(key => path.join(api.paths.cwd, key, '**/*.md')),
      ...opts.resolve.examples.map(key => path.join(api.paths.cwd, key, '*.{tsx,jsx}')),
    ];
  });

  // register plugin-analytics
  if (
    !api.hasPlugins(['@umijs/plugin-analytics']) &&
    // search plugins of other presets
    api.service._extraPlugins.every(({ id }) => id !== '@umijs/plugin-analytics')
  ) {
    api.registerPlugins([require.resolve('@umijs/plugin-analytics')]);
  }

  // TODO: CLI help info
  // TODO: site title support for routes
}
