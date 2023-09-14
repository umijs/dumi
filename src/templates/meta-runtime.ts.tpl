import { warning } from 'rc-util';
import { tabs } from './tabs';
import { filesFrontmatter } from './frontmatter';
import deepmerge from '{{{deepmerge}}}';

// Proxy do not warning since `Object.keys` will get nothing to loop
function wrapEmpty(meta, fieldName, defaultValue) {
  Object.defineProperty(meta, fieldName, {
    get: () => {
      warning(false, `'${fieldName}' return empty in latest version.`);
      return defaultValue;
    },
  });
}

export const patchRoutes = ({ routes }) => {
  Object.values(routes).forEach((route) => {
    if (filesFrontmatter[route.id]) {
      if (process.env.NODE_ENV === 'production' && (route.meta?.frontmatter?.debug || filesFrontmatter[route.id].debug)) {
        // hide route in production which set hide frontmatter
        delete routes[route.id];
      } else {
        // merge meta to route object
        route.meta = deepmerge(route.meta, { frontmatter: filesFrontmatter[route.id] });

        wrapEmpty(route.meta, 'demos', {});
        wrapEmpty(route.meta, 'texts', []);

        // apply real tab data from id
        route.meta.tabs = route.meta.tabs?.map((id) => {
          const meta = {
            frontmatter: filesFrontmatter[id] || { title: tabs[id].title },
            toc: [],
            texts: [],
          }

          wrapEmpty(meta, 'demos', {});
          wrapEmpty(meta, 'texts', []);

          return {
            ...tabs[id],
            meta,
          }
        });
      }
    }
  });
}
