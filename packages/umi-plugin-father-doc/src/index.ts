import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { isPlainObject } from 'lodash';
import { IApi, IRoute } from 'umi-types';
import getRouteConfig from './routes/getRouteConfig';
import getMenuFromRoutes from './routes/getMenuFromRoutes';
import getHostPkgAlias from './utils/getHostPkgAlias';
import { setUserExtraBabelPlugin } from './transformer/demo';

export interface IFatherDocOpts {
  title?: string;
  logo?: URL;
  desc?: string;
  include?: string[];
  routes?: {
    path: IRoute['path'];
    component: IRoute['component'];
    redirect: IRoute['redirect'];
    [key: string]: any;
  }[];
}

function docConfigPlugin() {
  return (api: IApi) => ({
    name: 'doc',
    validate(val: any) {
      assert(
        isPlainObject(val),
        `Configure item doc should be Plain Object, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart('Configure item doc Changed.');
    },
  })
}

export default function (api: IApi, opts: IFatherDocOpts) {
  // apply default options
  const defaultTitle = require(path.join(api.paths.cwd, 'package.json')).name;
  opts = Object.assign(
    {
      title: defaultTitle,
      include: ['docs'],
    },
    {
      routes: api.config.routes
    },
    (api.config as any).doc,
    opts,
  );

  // register doc config on umi system config
  api._registerConfig(docConfigPlugin);

  // apply umi-plugin-react for use title
  api.registerPlugin({
    id: require.resolve('umi-plugin-react'),
    apply: require('umi-plugin-react').default,
    opts: { title: { defaultTitle: opts.title || defaultTitle } },
  });

  // repalce default routes with generated routes
  api.modifyRoutes((routes) => {
    const result = getRouteConfig(api.paths, opts);
    const childRoutes = result[0].routes;

    // append umi NotFound component to routes
    childRoutes.push(...routes.filter(({ path }) => !path));
    return result;
  });

  // pass menu props for layout component
  api.modifyRouteComponent((module, { importPath, component }) => {
    let ret = module;
    const meta = {
      menu: {
        items: getMenuFromRoutes(api.routes[0].routes),
      },
      title: opts.title,
      logo: opts.logo,
      desc: opts.desc,
    };

    if (/\/layout\.[tj]sx?$/.test(component)) {
      ret = `props => React.createElement(require('${
          importPath
        }').default, {
          ...${
            // escape " to ^ to avoid umi parse error, then umi will decode them
            // see also: https://github.com/umijs/umi/blob/master/packages/umi-build-dev/src/routes/stripJSONQuote.js#L4
            JSON.stringify(meta).replace(/\"/g, '^')
          },
          ...props,
        })`;
    }

    return ret;
  });

  // exclude .md file for url-loader
  api.modifyDefaultConfig(config => ({
    ...config,
    urlLoaderExcludes: [/\.md$/],
    // pass empty routes if pages path does not exist and no routes config
    // to avoid umi throw src directory not exists error
    routes: (
      (fs.existsSync(api.paths.absPagesPath) && !api.config.routes)
        ? undefined
        : []
    ),
  }));

  // configure loader for .md file
  api.chainWebpackConfig(config => {
    config.module
      .rule('md')
      .test(/\.md$/)
      .use('father-doc')
      .loader(require.resolve('./loader'));

    // disable css modules for built-in theme
    config.module
      .rule('less-in-node_modules')
      .include
      .add(path.join(__dirname, './themes'));
    config.module
      .rule('less')
      .exclude
      .add(path.join(__dirname, './themes'));

    // add alias for current package(s)
    getHostPkgAlias(api.paths).forEach(([pkgName, pkgPath]) => {
      config.resolve.alias.set(pkgName, pkgPath);
    });
  });

  // modify help info
  api._modifyHelpInfo(memo => {
    memo.scriptName = 'father-doc';
    return memo;
  });

  // watch .md files
  api.addPageWatcher([
    ...opts.include.map(key => path.join(api.paths.cwd, key, '**/*.md')),
    path.join(api.paths.absPagesPath, '**/*.md'),
  ]);

  // sync user extra babel plugins for demo transformer
  api.modifyAFWebpackOpts((memo) => {
    if (memo.extraBabelPlugins) {
      setUserExtraBabelPlugin(api.config.extraBabelPlugins);
    }

    return memo;
  });
}
