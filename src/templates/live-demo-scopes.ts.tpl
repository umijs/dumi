{{#metaFiles}}
import { scopeIndex as scpi{{{index}}} } from '{{{file}}}?type=scope-index';
{{/metaFiles}}

const scopeIndexes: Record<string, { ids: string[], getter: () => Promise<any> }> = {
  {{#metaFiles}}
  ...scpi{{{index}}},
  {{/metaFiles}}
};

/** Async to load demo by id */
export const getDemoScopesById = async (id: string) => {
  const getter = scopeIndexes[id];

  if (!getter) {
    return {};
  }

  const { scopes }: any = await getter() || {};

  return scopes?.[id] || {};
};
