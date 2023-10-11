{{#metaFiles}}
import { demoIndex as dmi{{{index}}} } from '{{{file}}}?type=demo-index';
{{/metaFiles}}

export const demoIndexes: Record<string, { ids: string[], getter: () => Promise<any> }> = {
  {{#metaFiles}}
  '{{{id}}}': dmi{{{index}}},
  {{/metaFiles}}
};

// Convert the demoIndex to a key-value pairs: <demoId, getter>
const demoIdMap = Object.keys(demoIndexes).reduce((total, current) => {
  const demoIndex = demoIndexes[current];
  const { ids, getter } = demoIndex;

  ids.forEach((id) => {
    total[id] = getter;
  });

  return total;
}, {});

/** Async to load demo by id */
export const getDemoById = async (id: string) => {
  const getter = demoIdMap[id];

  if (!getter) {
    return null;
  }

  const { demos }: any = await getter() || {};

  return demos?.[id];
};
