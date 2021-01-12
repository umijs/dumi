import path from 'path';
import slash from 'slash2';
import type { RouteProcessor } from '.';

/**
 * Umi process route component from pages path but dumi process with cwd, so the path need to be converted
 */
export default (function relative(routes) {
  return routes.map(route => {
    if (route.component && !path.isAbsolute(route.component)) {
      // same as: https://github.com/umijs/umi/blob/ef674b120c9a3188f0167a9fa2211d3cdbf60a21/packages/core/src/Route/Route.ts#L34
      const isConventional = !this.umi?.config?.routes;

      route.component = slash(
        path.relative(
          // ref: https://github.com/umijs/umi/blob/ef674b120c9a3188f0167a9fa2211d3cdbf60a21/packages/core/src/Route/Route.ts#L114
          isConventional
            ? path.join(this.umi.paths.absTmpPath, 'core')
            : this.umi.paths.absPagesPath,
          path.join(this.umi.paths.cwd, route.component),
        ),
      );
    }

    return route;
  });
} as RouteProcessor);
