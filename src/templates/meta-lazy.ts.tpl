export const lazyMeta = async (id: string) => {
  switch (id) {
    {{#metaFiles}}
    case "{{{id}}}":
      return await import('{{{file}}}?type=meta');
    {{/metaFiles}}

    default:
      return null;
  }
};