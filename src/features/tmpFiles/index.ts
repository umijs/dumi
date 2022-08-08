import type { IApi } from '@/types';
import { Mustache } from 'umi/plugin-utils';

export default (api: IApi) => {
  const mdRouteFiles: { index: number; file: string }[] = [];

  api.describe({ key: 'dumi:tmpFiles' });

  api.modifyRoutes((routes) => {
    // collect all markdown route files for combine demos
    Object.values(routes).forEach((route) => {
      if (route.file.endsWith('.md')) {
        mdRouteFiles.push({ index: mdRouteFiles.length, file: route.file });
      }
    });

    return routes;
  });

  api.onGenerateFiles(() => {
    // generate demos entry
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/demos.tsx',
      content: Mustache.render(
        `{{#mdRouteFiles}}
import demos{{{index}}} from '{{{file}}}?type=meta.demos';
{{/mdRouteFiles}}

export default {
  {{#mdRouteFiles}}
  ...demos{{{index}}},
  {{/mdRouteFiles}}
}`,
        { mdRouteFiles },
      ),
    });

    // generate context layout
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/Layout.tsx',
      content: `import { Context } from 'dumi/theme';
import { useOutlet } from 'umi';
import demos from './demos';

export default function DumiContextLayout() {
  const outlet = useOutlet();

  return (
    <Context.Provider value={{ demos }}>{outlet}</Context.Provider>
  );
}`,
    });
  });
};
