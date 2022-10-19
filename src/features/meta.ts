import type { IApi } from '@/types';
import path from 'path';
import { Mustache, winPath } from 'umi/plugin-utils';
import { isTabRouteFile } from './tabs';

export const TABS_META_PATH = 'dumi/meta/tabs.ts';
export const ATOMS_META_PATH = 'dumi/meta/atoms.ts';

export default (api: IApi) => {
  const metaFiles: { index: number; file: string; id: string }[] = [];

  api.modifyRoutes((routes) => {
    // reset for re-generate files
    metaFiles.length = 0;

    // collect all markdown route files for combine demos & page meta
    Object.values(routes).forEach((route) => {
      if (
        !route.isLayout &&
        !/\*|:/.test(route.path) &&
        !isTabRouteFile(route.file)
      ) {
        metaFiles.push({
          index: metaFiles.length,
          file: route.file,
          id: route.id,
        });
      }
    });

    return routes;
  });

  api.onGenerateFiles(async () => {
    // generate empty atoms, then fill it by ./parser.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: ATOMS_META_PATH,
      content: 'export const components = null;',
    });

    // generate meta entry
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/index.ts',
      content: Mustache.render(
        `{{#metaFiles}}
import { demos as d{{{index}}}, frontmatter as fm{{{index}}}, toc as toc{{{index}}}, texts as txt{{{index}}} } from '{{{file}}}?type=meta';
{{/metaFiles}}

export { components } from './atoms';
export { tabs } from './tabs';

export const demos = {
  {{#metaFiles}}
  ...d{{{index}}},
  {{/metaFiles}}
};

export const filesMeta = {
  {{#metaFiles}}
  '{{{id}}}': {
    frontmatter: fm{{{index}}},
    toc: toc{{{index}}},
    texts: txt{{{index}}},
    {{#tabs}}
    tabs: {{{tabs}}},
    {{/tabs}}
  },
  {{/metaFiles}}
}`,
        {
          metaFiles: await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'dumi.modifyMetaFiles',
            initialValue: metaFiles,
          }),
        },
      ),
    });

    // generate runtime plugin, to append page meta to route object
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/runtime.ts',
      content: `import { filesMeta, tabs } from '.';
import deepmerge from '${winPath(
        path.dirname(require.resolve('deepmerge/package')),
      )}';
export const patchRoutes = ({ routes }) => {
  Object.values(routes).forEach((route) => {
    if (filesMeta[route.id]) {
      route.meta = deepmerge(route.meta, filesMeta[route.id]);

      // apply real tab data from id
      route.meta.tabs = route.meta.tabs?.map(id => ({
        ...tabs[id],
        meta: filesMeta[id],
      }));
    }
  });
}
`,
    });
  });

  api.addRuntimePlugin(() => '@@/dumi/meta/runtime.ts');
};
