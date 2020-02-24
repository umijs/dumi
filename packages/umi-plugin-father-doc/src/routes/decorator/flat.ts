import { IRoute } from 'umi-types';
import { RouteProcessor } from '.';

function process(routes: IRoute[], parent?: IRoute) {
  const result: IRoute[] = [];

  routes.forEach(route => {
    const { routes: childs = [], ...current } = route;

    if (childs.length) {
      // discard parent route if there has child routes
      result.push(...process(childs, current));
    } else {
      // push parent route directly if there has no child route
      if (typeof parent?.component === 'string') {
        // use parent component as Umi's Routes (like layout wrapper)
        current.Routes = [parent.component as string, ...(current.Routes || [])];
      }

      result.push(current);
    }
  });

  return result;
}

/**
 * flat child routes decorator
 */
export default (routes => process(routes)) as RouteProcessor;
