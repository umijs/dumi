import { TEMPLATES_DIR } from '@/constants';
import { isTabRouteFile } from '@/features/tabs';
import { join } from 'path';
import { IApi, IRoute } from 'umi';
import { winPath } from 'umi/plugin-utils';

type MarkdownFiles = { index: number; file: string; id: string }[];

export default (api: IApi) => {
  const mdFiles: MarkdownFiles = [];

  api.describe({
    key: 'live',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
    enableBy: api.EnableBy.register,
  });

  api.register({
    key: 'modifyRoutes',
    // make sure it is called last
    stage: Infinity,
    fn: (routes: Record<string, IRoute>) => {
      // reset for re-generate files
      mdFiles.length = 0;

      // collect all markdown route files for combine demos & page meta
      Object.values(routes).forEach((route) => {
        if (
          !route.isLayout &&
          !/\*|:/.test(route.path) &&
          route.file &&
          !isTabRouteFile(route.file) &&
          route.file.endsWith('.md')
        ) {
          mdFiles.push({
            index: mdFiles.length,
            file: winPath(route.file),
            id: route.id,
          });
        }
      });

      return routes;
    },
  });

  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/live/demo-scopes.ts',
      tplPath: winPath(
        join(
          TEMPLATES_DIR,
          'live',
          !!api.config.live ? 'demo-scopes.ts.tpl' : 'disabled.ts.tpl',
        ),
      ),
      context: {
        metaFiles: mdFiles,
      },
    });
  });
};
