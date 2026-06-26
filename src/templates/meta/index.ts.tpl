{{#metaFiles}}
{{#loadDemoIndex}}
import { frontmatter as fm{{{index}}}, toc as t{{{index}}}, demoIndex as dmi{{{index}}} } from '{{{file}}}?type=frontmatter';
{{/loadDemoIndex}}
{{^loadDemoIndex}}
import { frontmatter as fm{{{index}}}, toc as t{{{index}}} } from '{{{file}}}?type=frontmatter';
{{/loadDemoIndex}}
{{/metaFiles}}

export const filesMeta = {
  {{#metaFiles}}
  '{{{id}}}': {
    frontmatter: fm{{{index}}},
    toc: t{{{index}}},
    {{#loadDemoIndex}}
    demoIndex: dmi{{{index}}},
    {{/loadDemoIndex}}
    {{#tabs}}
    tabs: {{{tabs}}},
    {{/tabs}}
    {{#isMarkdown}}
    textGetter: () => import({{{chunkName}}}'{{{file}}}?type=text'),
    {{/isMarkdown}}
  },
  {{/metaFiles}}
}

export { tabs as tabsMeta } from './tabs';
