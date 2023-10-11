// This will bundle all the site demos and meta data into one file
// which should only async load on search
import { getRouteMetaById } from './route-meta';
import { demoIndexes } from './demos';
import { filesFrontmatter } from './frontmatter';

// generate demos data in runtime, for reuse route.id to reduce bundle size
export const demos = {};

/** @private Internal usage. Safe to refactor. */
export async function loadFilesMeta(idList: string[]) {
  const metaMap: Record<string, any> = {};

  {{#metaFiles}}
  if (idList.includes('{{{id}}}')) {
    metaMap['{{{id}}}'] = async () => {
      const routeMeta = await getRouteMetaById('{{{id}}}');
      const demo = await demoIndexes['{{{id}}}']?.getter() || {};
      return {
        frontmatter: filesFrontmatter['{{{id}}}'] ?? {},
        toc: routeMeta?.toc ?? [],
        texts: routeMeta?.texts ?? [],
        tabs: routeMeta?.tabs ?? [],
        demos: demo?.demos ?? {},
      };
    };
  }
  {{/metaFiles}}

  // Wait for all meta data to be loaded
  const metaList = await Promise.all(Object.entries(metaMap).map(([id, getter]) => getter()));

  // Merge into filesMeta
  const filesMeta = {};

  Object.entries(metaMap).forEach(([id], index) => {
    filesMeta[id] = metaList[index];
  });

  return filesMeta;
}
