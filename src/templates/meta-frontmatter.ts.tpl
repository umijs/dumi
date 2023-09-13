{{#metaFiles}}
import { frontmatter as fm{{{index}}} } from '{{{file}}}?type=frontmatter';
{{/metaFiles}}

export const filesFrontmatter = {
  {{#metaFiles}}
  '{{{id}}}': {
    frontmatter: fm{{{index}}},
  },
  {{/metaFiles}}
}
