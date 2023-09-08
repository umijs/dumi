import { TEMPLATES_DIR } from '@/constants';
import type { IApi } from '@/types';
import path, { join } from 'path';
import type { IRoute } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { isTabRouteFile } from './tabs';

export const TABS_META_PATH = 'dumi/meta/tabs.ts';
export const ATOMS_META_PATH = 'dumi/meta/atoms.ts';

type MetaFiles = { index: number; file: string; id: string }[];

export default (api: IApi) => {
  const metaFiles: MetaFiles = [];

  api.register({
    key: 'modifyRoutes',
    // make sure it is called last
    stage: Infinity,
    fn: (routes: Record<string, IRoute>) => {
      // reset for re-generate files
      metaFiles.length = 0;

      // collect all markdown route files for combine demos & page meta
      Object.values(routes).forEach((route) => {
        if (
          !route.isLayout &&
          !/\*|:/.test(route.path) &&
          route.file &&
          !isTabRouteFile(route.file)
        ) {
          metaFiles.push({
            index: metaFiles.length,
            file: winPath(route.file),
            id: route.id,
          });
        }
      });

      return routes;
    },
  });

  api.onGenerateFiles(async () => {
    // generate empty atoms, then fill it by ./parser.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: ATOMS_META_PATH,
      content: 'export const components = null;',
    });

    // [legacy] generate meta entry
    const parsedMetaFiles: MetaFiles = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'dumi.modifyMetaFiles',
      initialValue: JSON.parse(JSON.stringify(metaFiles)),
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/index.ts',
      tplPath: winPath(join(TEMPLATES_DIR, 'meta.ts.tpl')),
      context: {
        metaFiles: parsedMetaFiles,
      },
    });

    // generate runtime plugin, to append page meta to route object
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/runtime.ts',
      tplPath: winPath(join(TEMPLATES_DIR, 'meta-runtime.ts.tpl')),
      context: {
        deepmerge: winPath(path.dirname(require.resolve('deepmerge/package'))),
      },
    });
  });

  api.addRuntimePlugin(() => '@@/dumi/meta/runtime.ts');
};
