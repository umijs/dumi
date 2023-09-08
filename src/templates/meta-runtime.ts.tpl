import { filesMeta, tabs } from '.';
import deepmerge from '{{{deepmerge}}}';
export const patchRoutes = ({ routes }) => {
  Object.values(routes).forEach((route) => {
    if (filesMeta[route.id]) {
      if (process.env.NODE_ENV === 'production' && (route.meta?.frontmatter?.debug || filesMeta[route.id].frontmatter.debug)) {
        // hide route in production which set hide frontmatter
        delete routes[route.id];
      } else {
        // merge meta to route object
        route.meta = deepmerge(route.meta, filesMeta[route.id]);

        // apply real tab data from id
        route.meta.tabs = route.meta.tabs?.map((id) => {
          const meta = {
            frontmatter: { title: tabs[id].title },
            toc: [],
            texts: [],
          }
          return {
            ...tabs[id],
            meta: filesMeta[id] || meta,
          }
        });
      }
    }
  });
}