import path from 'path';
import { IApi } from 'umi-types';
import getRouteConfig from './routes/getRouteConfig';

export default function (api: IApi) {
  api.registerPlugin({
    id: require.resolve('umi-plugin-react'),
    apply: require('umi-plugin-react').default,
    opts: { title: 'father-doc' },
  });

  api.modifyRoutes((routes) => {
    const result = getRouteConfig(api.paths);
    const childRoutes = result[0].routes;

    // insert TitleWrapper for routes
    childRoutes.forEach((item) => {
      // see also: https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/src/plugins/title/index.js#L37
      if (item.title && (!item.routes || !item.routes.length)) {
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
}
