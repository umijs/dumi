import path from 'path';
import assert from 'assert';
import { isPlainObject } from 'lodash';
import { IApi, IRoute } from 'umi-types';
import getRouteConfig from './routes/getRouteConfig';
import getMenuFromRoutes from'./routes/getMenuFromRoutes';

export interface IFatherDocOpts {
  name?: string;
  logo?: URL;
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
  opts = Object.assign({
    name: require(path.join(api.paths.cwd, 'package.json')).name,
    include: ['docs'],
  }, (api.config as any).doc, opts);

  const routeConfig = getRouteConfig(api.paths, opts);

  // register doc config on umi system config
  api._registerConfig(docConfigPlugin);

  // apply umi-plugin-react for use title
  api.registerPlugin({
    id: require.resolve('umi-plugin-react'),
    apply: require('umi-plugin-react').default,
    opts: { title: { defaultTitle: opts.name } },
  });

  // repalce default routes with generated routes
  api.modifyRoutes((routes) => {
    const result = routeConfig;
    const childRoutes = result[0].routes;

    // insert TitleWrapper for routes
    childRoutes.forEach((item) => {
      // see also: https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/src/plugins/title/index.js#L37
      if (!item.routes || !item.routes.length) {
        item.Routes = [
          ...(item.Routes || []),
          path.relative(api.paths.cwd, path.join(api.paths.absTmpDirPath, './TitleWrapper.jsx')),
        ];
      }
    });

    // append umi NotFound component to routes
    childRoutes.push(...routes.filter(({ path }) => !path));

    return result;
  });

  // pass menu props for layout component
  api.modifyRouteComponent((module, { component }) => {
    let ret = module;

    if (/\/layout\.[tj]sx?$/.test(component)) {
      ret = `props => React.createElement(${
        module
      }, { menu: { items: ${
        JSON.stringify(getMenuFromRoutes(routeConfig[0].routes)).replace(/\"/g, '\'')
      } }, ...props })`;
    }

    return ret;
  });

  // exclude .md file for url-loader
  api.modifyDefaultConfig(config => ({
    ...config,
    urlLoaderExcludes: [/\.md$/],
  }));

  // configure loader for .md file
  api.chainWebpackConfig(config => {
    config.module
      .rule('md')
      .test(/\.md$/)
      .use('father-doc')
      .loader(require.resolve('./loader'));
  });
}
