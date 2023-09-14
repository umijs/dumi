{{#metaFiles}}
import { frontmatter as fm{{{index}}} } from '{{{file}}}?type=frontmatter';
{{/metaFiles}}

export const filesFrontmatter = {
  {{#metaFiles}}
  '{{{id}}}': fm{{{index}}},
  {{/metaFiles}}
}
