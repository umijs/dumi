import path from 'path';
import slash from 'slash2';
import { RouteProcessor } from '.';

/**
 * Umi process route component from pages path but dumi process with cwd, so the path need to be converted
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
