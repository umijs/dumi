import {
  demos,
  frontmatter,
  toc,
  texts
} from '{{{file}}}?type=meta';

export const filesMeta = {
    frontmatter,
    toc,
    texts,
    demos,
    {{#tabs}}
    tabs: {{{tabs}}},
    {{/tabs}}
}
