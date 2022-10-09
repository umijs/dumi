import type { IApi } from '@/types';
import { Mustache } from 'umi/plugin-utils';

export const ATOMS_META_PATH = 'dumi/meta/atoms.ts';

export default (api: IApi) => {
  const routeFiles: { index: number; file: string; id: string }[] = [];

  api.modifyRoutes((routes) => {
    // reset for re-generate files
    routeFiles.length = 0;

    // collect all markdown route files for combine demos & page meta
    Object.values(routes).forEach((route) => {
      if (!route.isLayout && !/\*|:/.test(route.path)) {
        routeFiles.push({
          index: routeFiles.length,
          file: route.file,
          id: route.id,
        });
      }
    });

    return routes;
  });

  api.onGenerateFiles(() => {
    // generate empty atoms
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
        `{{#routeFiles}}
import { demos as d{{{index}}}, frontmatter as fm{{{index}}}, toc as toc{{{index}}} } from '{{{file}}}?type=meta';
{{/routeFiles}}

export { components } from './atoms';

export const demos = {
  {{#routeFiles}}
  ...d{{{index}}},
  {{/routeFiles}}
};

export const routesMeta = {
  {{#routeFiles}}
  '{{{id}}}': { frontmatter: fm{{{index}}}, toc: toc{{{index}}} },
  {{/routeFiles}}
}`,
        { routeFiles },
      ),
    });

    // generate runtime plugin, to append page meta to route object
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/runtime.ts',
      content: `import { routesMeta } from '.';
export const patchRoutes = ({ routes }) => {
  Object.values(routes).forEach((route) => {
    if (routesMeta[route.id]) {
      route.meta = { ...route.meta, ...routesMeta[route.id] };
    }
  });
}
`,
    });
  });

  api.addRuntimePlugin(() => '@@/dumi/meta/runtime.ts');
};
