{{#metaFiles}}
{{#isMarkdown}}
import { frontmatter as fm{{{index}}}, toc as t{{{index}}}, demoIndex as dmi{{{index}}} } from '{{{file}}}?type=frontmatter';
{{/isMarkdown}}
{{^isMarkdown}}
import { frontmatter as fm{{{index}}}, toc as t{{{index}}} } from '{{{file}}}?type=frontmatter';
{{/isMarkdown}}
{{/metaFiles}}

export const filesMeta = {
  {{#metaFiles}}
  '{{{id}}}': {
    frontmatter: fm{{{index}}},
    toc: t{{{index}}},
    {{#isMarkdown}}
    demoIndex: dmi{{{index}}},
    {{/isMarkdown}}
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
