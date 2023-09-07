{{#metaFiles}}
import { demos as dm{{{index}}}, frontmatter as fm{{{index}}}, toc as toc{{{index}}}, texts as txt{{{index}}} } from '{{{file}}}?type=meta';
{{/metaFiles}}

export { components } from './atoms';
export { tabs } from './tabs';

export const filesMeta = {
  {{#metaFiles}}
  '{{{id}}}': {
    frontmatter: fm{{{index}}},
    toc: toc{{{index}}},
    texts: txt{{{index}}},
    demos: dm{{{index}}},
    {{#tabs}}
    tabs: {{{tabs}}},
    {{/tabs}}
  },
  {{/metaFiles}}
}

// generate demos data in runtime, for reuse route.id to reduce bundle size
export const demos = Object.entries(filesMeta).reduce((acc, [id, meta]) => {
  // append route id to demo
  Object.values(meta.demos).forEach((demo) => {
    demo.routeId = id;
  });
  // merge demos
  Object.assign(acc, meta.demos);

  // remove demos from meta, to avoid deep clone demos in umi routes/children compatible logic
  delete meta.demos;

  return acc;
}, {});