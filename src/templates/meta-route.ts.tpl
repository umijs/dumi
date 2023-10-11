import { tabs } from './tabs';
import { filesFrontmatter } from './frontmatter';

const files = {
{{#metaFiles}}
  '{{{id}}}': {
    textGetter: () => import({{{chunkName}}}'{{{file}}}?type=text'),
    {{#tabs}}
    tabs: {{{tabs}}},
    {{/tabs}}
  },
{{/metaFiles}}
};

export const getRouteMetaById = async (id: string) => {
  const file = files[id];

  if (!file) {
    return null;
  }

  const text = await file.textGetter();
  const frontmatter = filesFrontmatter[id];

  const tabsMeta = file.tabs && await Promise.all(file.tabs.map(async (tab) => {
    const meta = await getRouteMetaById(tab) ?? {
      frontmatter: { title: tabs[tab].title },
      toc: [],
      texts: [],
    };
    return {
      ...tabs[tab],
      meta,
    }
  }));

  return {
    texts: text?.texts,
    toc: text?.toc,
    frontmatter,
    tabs: tabsMeta,
  };
}
