import path from 'path';
import slash from 'slash2';
import { RouteProcessor } from '.';

/**
 * set title for route
 */
export default (function title(routes) {
  return routes.map(route => {
    // generate title if user did not configured
    if (!route.meta.title && typeof route.component === 'string') {
      let clearFilename = path.parse(route.component).name;

      // discard locale for component filename
      if (route.meta.locale) {
        clearFilename = clearFilename.replace(`.${route.meta.locale}`, '');
      }

      // index => Index
      route.meta.title = clearFilename.replace(/^[a-z]/, s => s.toUpperCase());
    }

    // apply meta title for umi routes
    route.title = route.meta.title;

    // apply TitleWrapper
    // see also: https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/src/plugins/title/index.js#L37
    route.Routes = (route.Routes || []).concat(
      `./${slash(
        path.relative(
          this.umi.paths.cwd,
          path.join(this.umi.paths.absTmpDirPath, './TitleWrapper.jsx'),
        ),
      )}`,
    );

    return route;
  });
} as RouteProcessor);
