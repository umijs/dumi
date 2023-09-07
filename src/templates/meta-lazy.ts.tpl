/**
* Record the demo meta info here: Record<id, routeId>
*/
export const demoRoutes: Record<string, string> = {};

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