// This will bundle all the site demos and meta data into one file
// which should only async load on search
const filesMetaTabs = {
  {{#metaFiles}}
  {{#tabs}}
  '{{{id}}}': {{{tabs}}},
  {{/tabs}}
  {{/metaFiles}}
}

// generate demos data in runtime, for reuse route.id to reduce bundle size
export const demos = {};

/** @private Internal usage. Safe to refactor. */
export async function loadFilesMeta() {
  const metaMap: Record<string, any> = {};
  const idList = [
    {{#metaFiles}}
    '{{{id}}}',
    {{/metaFiles}}
  ];

  {{#metaFiles}}
  metaMap['{{{id}}}'] = import('{{{file}}}?type=meta');
  {{/metaFiles}}

  // Wait for all meta data to be loaded
  const metaList = await Promise.all(idList.map(id => metaMap[id]));

  // Merge into filesMeta
  const filesMeta = {};

  idList.forEach((id, index) => {
    const meta = metaList[index];

    filesMeta[id] = {
      ...meta,
      tabs: filesMetaTabs[id],
    };
  });

  return filesMeta;
}