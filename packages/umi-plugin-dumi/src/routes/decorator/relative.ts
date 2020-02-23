import path from 'path';
import slash from 'slash2';
import { RouteProcessor } from '.';

/**
 * this processor only use to convert relative component path to be relatived with umi temp routes.ts
 * it will be removed when umi 3 resolve relative component path properly like umi 2
 */
export default (function relative(routes) {
  return routes.map(route => {
    if (route.component && !path.isAbsolute(route.component)) {
      route.component = slash(
        path.relative(
          path.join(this.umi.paths.absTmpPath, 'core'),
          path.join(this.umi.paths.cwd, route.component),
        ),
      );
    }

    return route;
  });
} as RouteProcessor);
