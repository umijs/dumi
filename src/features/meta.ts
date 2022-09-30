import type { IApi } from '@/types';
import { Mustache } from 'umi/plugin-utils';

export default (api: IApi) => {
  const mdRouteFiles: { index: number; file: string; id: string }[] = [];

  api.modifyRoutes((routes) => {
    // reset for re-generate files
    mdRouteFiles.length = 0;

    // collect all markdown route files for combine demos & page meta
    Object.values(routes).forEach((route) => {
      if (route.file.endsWith('.md')) {
        mdRouteFiles.push({
          index: mdRouteFiles.length,
          file: route.file,
          id: route.id,
        });
      }
    });

    return routes;
  });

  api.onGenerateFiles(() => {
    // generate meta entry
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/index.ts',
      content: Mustache.render(
        `{{#mdRouteFiles}}
import { demos as d{{{index}}}, frontmatter as fm{{{index}}}, toc as toc{{{index}}} } from '{{{file}}}?type=meta';
{{/mdRouteFiles}}

export const demos = {
  {{#mdRouteFiles}}
  ...d{{{index}}},
  {{/mdRouteFiles}}
};

export const routesMeta = {
  {{#mdRouteFiles}}
  '{{{id}}}': { frontmatter: fm{{{index}}}, toc: toc{{{index}}} },
  {{/mdRouteFiles}}
}`,
        { mdRouteFiles },
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
