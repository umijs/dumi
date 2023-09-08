// Collect all the demos info with KV: id -> routeId
{{#metaFiles}}
import { demoIndex as dmi{{{index}}} } from '{{{file}}}?type=demo-index';
{{/metaFiles}}

export const demoRoutes: Record<string, string> = {
  {{#metaFiles}}
  {{/metaFiles}}
};