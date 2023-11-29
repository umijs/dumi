import { warning } from 'rc-util';
import deepmerge from '{{{deepmerge}}}';
import { getRouteMetaById } from './exports';

// Proxy do not warning since `Object.keys` will get nothing to loop
function wrapEmpty(meta, fieldName, defaultValue) {
  Object.defineProperty(meta, fieldName, {
    get: () => {
      warning(false, `'${fieldName}' return empty in latest version, please use \`useRouteMeta\` instead.`);
      return defaultValue;
    },
  });
}

export const patchRoutes = ({ routes }) => {
  Object.values(routes).forEach((route) => {
    const routeMeta = getRouteMetaById(route.id, { syncOnly: true });

    if (routeMeta) {
      if (process.env.NODE_ENV === 'production' && (route.meta?.frontmatter?.debug || routeMeta.debug)) {
        // hide route in production which set hide frontmatter
        delete routes[route.id];
      } else {
        // merge meta to route object
        route.meta = deepmerge(route.meta, routeMeta);

        wrapEmpty(route.meta, 'toc', []);
        wrapEmpty(route.meta, 'texts', []);

        route.meta.tabs?.forEach((tab) => {
          wrapEmpty(tab, 'toc', []);
          wrapEmpty(tab, 'texts', []);
        });
      }
    }
  });
}
