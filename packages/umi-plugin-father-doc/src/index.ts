import { IApi } from 'umi-types';
import getRouteConfig from './routes/getRouteConfig';

export default function (api: IApi) {
  api.modifyRoutes((routes) => {
    const result = getRouteConfig(api.paths);

    // append umi NotFound component to routes
    result[0].routes.push(...routes.filter(({ path }) => !path));

    return result;
  });
}
