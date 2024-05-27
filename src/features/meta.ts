import type { IApi } from '@/types';
import { generateMetaChunkName } from '@/utils';
import path from 'path';
import type { IRoute } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { isTabRouteFile } from './tabs';

export const TABS_META_PATH = 'dumi/meta/tabs.ts';
export const ATOMS_META_PATH = 'dumi/meta/atoms.ts';

type IMetaFiles = {
  index: number;
  file: string;
  id: string;
  isMarkdown?: boolean;
}[];

export default (api: IApi) => {
  const metaFiles: IMetaFiles = [];

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

    const parsedMetaFiles: IMetaFiles = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'dumi.modifyMetaFiles',
      initialValue: JSON.parse(JSON.stringify(metaFiles)),
    });

    // mark isMarkdown flag
    parsedMetaFiles.forEach((metaFile) => {
      metaFile.isMarkdown = metaFile.file.endsWith('.md');
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/index.ts',
      tplPath: require.resolve('../templates/meta/index.ts.tpl'),
      context: {
        metaFiles: parsedMetaFiles,
        chunkName: function chunkName(this) {
          if (!('file' in this)) {
            return '';
          }
          return `/* webpackChunkName: "${generateMetaChunkName(
            this.file,
            api.cwd,
            api.config.locales?.map(({ id }) => id),
          )}" */`;
        },
      },
    });

    // generate runtime plugin, to append page meta to route object
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/runtime.ts',
      tplPath: require.resolve('../templates/meta/runtime.ts.tpl'),
      context: {
        deepmerge: winPath(path.dirname(require.resolve('deepmerge/package'))),
        rc_util: winPath(path.dirname(require.resolve('rc-util/package'))),
      },
    });

    // generate exports api
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/meta/exports.ts',
      tplPath: require.resolve('../templates/meta/exports.ts.tpl'),
      context: {},
    });
  });

  api.addRuntimePlugin(() => '@@/dumi/meta/runtime.ts');
};
