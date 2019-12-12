import path from 'path';
import { IRoute, IApi } from 'umi-types';
import deepmerge from 'deepmerge';
import getFrontMatter from './getFrontMatter';

function routeSorter(prev, next) {
  const prevOrder = typeof(prev.meta.order) === 'number' ? prev.meta.order : 0;
  const nextOrder = typeof(next.meta.order) === 'number' ? next.meta.order : 0;

  return (prevOrder === nextOrder) ? 0 : (nextOrder - prevOrder);
}

/**
 * make standard umi routes has meta & group
 * @note  route will be decorated following contents:
 *        - add meta data that generated from markdown file
 *        - add title field & TitleWrapper to display page title
 *        - sort routes & group by order field
 *        - group routes by group field & directory nest
 */
export default function decorateRoutes(routes: IRoute[], paths: IApi['paths'], parentRoute?: IRoute) {
  let result: IRoute[];

  // read yaml config for current level routes
  routes.forEach((route) => {
    route.meta = route.component ? deepmerge(route.meta, getFrontMatter(route.component as string)) : {};

    // apply yaml title
    route.title = route.meta.title;

    // apply TitleWrapper
    // see also: https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/src/plugins/title/index.js#L37
    route.Routes = (route.Routes || []).concat(
      path.relative(paths.cwd, path.join(paths.absTmpDirPath, './TitleWrapper.jsx')),
    );
  });

  // split grouped & ungrouped routes for current level routes
  const [ungrouped, groupedMapping] = routes.reduce((result, item) => {
    if (item.meta.group?.path) {
      // prefix parent route for route
      item.path = path.join(item.meta.group.path, item.path);

      if (!parentRoute) {
        // only process top level group routes
        const key = item.meta.group.path;

        if (result[1][key]) {
          result[1][key].push(item);
        } else {
          result[1][key] = [item];
        }
      } else {
        // correct parent route path if it is not top level group
        // can be use to correct path for automatic parent route from directory
        parentRoute.path = item.meta.group.path;
        result[0].push(item);
      }
    } else {
      // prefix parent route for route
      if (parentRoute) {
        item.path = path.join(parentRoute.path, item.path).replace(/\/$/, '');
      }

      result[0].push(item);
    }

    return result;
  }, [[], {}]);

  // process child routes for ungropued routes if there is top level
  if (!parentRoute) {
    ungrouped.forEach((route) => {
      if (route.routes) {
        route.routes = decorateRoutes(route.routes, paths, route);
        // redirect to the first child route when visit root path
        route.routes.push({
          path: route.path,
          redirect: route.routes[0].path,
        });

        // use group title for parent routes
        if (route.routes[0].meta?.group.title) {
          route.meta.title = route.routes[0].meta.group.title;
        }
      }
    });
  }

  // concat ungrouped routes & grouped items
  result = ungrouped.concat(
    Object
      .keys(groupedMapping)
      .map(key => {
        // find first configured child
        const configuredChild = groupedMapping[key].find(item => item.meta.group);
        const groupTitle = configuredChild ? configuredChild.meta.group.title : key.replace(/^\/|\/$/g, '');
        const groupOrder = configuredChild ? configuredChild.meta.group.order : undefined;

        return {
          path: key,
          routes: groupedMapping[key].concat({
            path: key,
            // redirect to the first child route when visit root path
            redirect: groupedMapping[key][0].path,
          }),
          meta: {
            title: groupTitle,
            order: groupOrder,
          },
        };
      })
  );

  // sort routes by order field
  result.sort(routeSorter);

  return result;
}
