{{#metaFiles}}
import { frontmatter as fm{{{index}}}, toc as toc{{{index}}} } from '{{{file}}}?type=meta';
{{/metaFiles}}

export { components } from './atoms';
export { tabs } from './tabs';

export const filesMeta = {
  {{#metaFiles}}
  '{{{id}}}': {
    frontmatter: fm{{{index}}},
    toc: toc{{{index}}},
    texts: [],
    demos: {},
    {{#tabs}}
    tabs: {{{tabs}}},
    {{/tabs}}
  },
  {{/metaFiles}}
}

// generate demos data in runtime, for reuse route.id to reduce bundle size
export const demos = {};