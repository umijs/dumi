import path from 'path';
import { IRoute, IApi } from 'umi-types';
import deepmerge from 'deepmerge';
import slash from 'slash2';
import getFrontMatter from './getFrontMatter';

function isNestedRoute(route: IRoute) {
  const parsed = typeof route.component === 'string' ? path.parse(route.component) : null;

  return (
    // at least 2-level path
    route.path.lastIndexOf('/') !== 0 ||
    // or component filename is the default entry
    (
      parsed &&
      route.path.length > 1 &&
      /^(index|readme)$/.test(parsed.name)
    )
  );
}

/**
 * make standard umi routes can be used by father-doc
 * @note  route will be decorated the following contents:
 *        - add meta from fallback meta & frontmatter
 *        - add title field & TitleWrapper to display page title
 *        - correct route path by group path (replace prefix)
 *        - flat child routes to the top-level routes
 *        - add index routes for group which has no index route
 */
export default function decorateRoutes(
  routes: IRoute[],
  paths: IApi['paths'],
  parentRoute?: IRoute,
) {
  const redirects: IRoute[] = [];
  const result = routes.reduce((total, route) => {
    const frontMatter = typeof route.component === 'string' ? getFrontMatter(route.component) : {};
    const fallbackMeta: any = {};

    // generate fallback group meta for nest route
    if (isNestedRoute(route)) {
      const groupPath = route.path.match(/^([^]+?)(\/[^/]+)?$/)[1];

      fallbackMeta.group = {
        path: groupPath,
      };
    }

    // set fallback title for route
    if (typeof route.component === 'string') {
      fallbackMeta.title = path.parse(route.component).name.replace(/^[a-z]/, s => s.toUpperCase());
    }

    // merge meta for route
    route.meta = deepmerge(
      fallbackMeta,
      frontMatter,
      (route.meta || {}), // allow user override meta via configuration routes
    );

    // fallback group title if there only has group path
    if(route.meta.group?.path && !route.meta.group.title) {
      route.meta.group.title = route.meta.group.path
        // discard start slash
        .replace(/^\//g, '')
        // upper case the first english letter
        .replace(/^[a-z]/, s => s.toUpperCase());
    }

    // apply meta title
    route.title = route.meta.title;

    // apply TitleWrapper
    // see also: https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/src/plugins/title/index.js#L37
    route.Routes = route.Routes || [];
    route.Routes.push(
      `./${slash(path.relative(paths.cwd, path.join(paths.absTmpDirPath, './TitleWrapper.jsx')))}`,
    );

    // unshift to Routes if parent route has component
    if (typeof parentRoute?.component === 'string') {
      route.Routes.unshift(parentRoute.component);
    }

    // correct route path by group path
    if (route.meta.group?.path && route.path !== route.meta.group.path) {
      route.path = slash(path.join(route.meta.group.path, route.path.match(/([^/]*)$/)[1]));
    }

    // flat child routes
    if (route.routes) {
      total.push(...decorateRoutes(route.routes, paths, route));
    } else {
      total.push(route);
    }

    return total;
  }, [] as IRoute[]);

  // add index route redirect for group which has no index route
  result.forEach((route) => {
    if (
      route.meta.group?.path &&
      !result.some(item => item.path === route.meta.group.path)
    ) {
      const { title, path, ...resGroupMeta } = route.meta.group;

      redirects.push({
        title,
        path,
        meta: {
          ...resGroupMeta
        },
        exact: true,
        redirect: result.find(item => item.meta.group?.path === route.meta.group.path).path,
      });
    }
  });

  return result.concat(redirects);
}
