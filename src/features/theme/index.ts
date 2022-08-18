import type { IApi } from '@/types';
import path from 'path';
import { Mustache } from 'umi/plugin-utils';

export default (api: IApi) => {
  const mdRouteFiles: { index: number; file: string }[] = [];

  api.describe({ key: 'dumi:theme' });
  api.modifyConfig((memo) => {
    memo.alias['dumi/theme'] = require.resolve('../../client/theme');

    // FIXME: for replace deps by MFSU in local
    memo.extraBabelIncludes ??= [];
    memo.extraBabelIncludes.push(path.resolve(__dirname, '../../client/theme'));

    return memo;
  });

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
      path: 'dumi/demos.ts',
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
      path: 'dumi/theme/ContextWrapper.tsx',
      content: `import { Context } from 'dumi/theme';
import { useOutlet } from 'umi';
import demos from '../demos';

export default function DumiContextWrapper() {
  const outlet = useOutlet();

  return (
    <Context.Provider value={{ demos }}>{outlet}</Context.Provider>
  );
}`,
    });
  });
};
