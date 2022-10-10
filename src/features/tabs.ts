import type { IApi } from '@/types';
import { createRouteId } from '@umijs/core/dist/route/utils';
import path from 'path';
import { Mustache, winPath } from 'umi/plugin-utils';
import { TABS_META_PATH } from './meta';

export function isTabRouteFile(file: string) {
  return file.includes('$tab-');
}

export function getTabKeyFromFile(file: string) {
  return file.match(/\$tab-([^.]+)/)![1];
}

export default (api: IApi) => {
  const tabs: {
    index: number;
    key: string;
    id: string;
    file: string;
    parentFile: string;
  }[] = [];

  api.describe({ key: undefined });

  // collect tabs from routes
  api.modifyRoutes((routes) => {
    tabs.length = 0;

    Object.values(routes).forEach((route) => {
      // remove $tab route from routes
      if (isTabRouteFile(route.file)) {
        delete routes[route.id];

        const rtlFile = winPath(path.relative(api.cwd, route.file));
        const routeId = createRouteId(rtlFile);
        const tabKey = getTabKeyFromFile(rtlFile);
        const parentFile = route.file.replace(/\$tab-[^.]+\./, '');

        tabs.push({
          index: tabs.length,
          key: tabKey,
          id: `${routeId}`,
          file: route.file,
          parentFile,
        });
      }
    });

    return routes;
  });

  // append tabs to meta files
  api.register({
    key: 'dumi.modifyMetaFiles',
    fn: (metaFiles: any) => {
      const tabsMapping = tabs.reduce<Record<string, typeof tabs>>(
        (ret, tab) => ({
          ...ret,
          [tab.parentFile]: [...(ret[tab.parentFile] || []), tab],
        }),
        {},
      );

      // add related tabs to meta files
      Object.values(metaFiles).forEach((metaFile: any) => {
        if (tabsMapping[metaFile.file]) {
          metaFile.tabs = JSON.stringify(
            tabsMapping[metaFile.file].map(({ id }) => id),
          );
        }
      });

      // append tabs to meta files
      tabs.forEach((tab) => {
        metaFiles.push({
          id: tab.id,
          file: tab.file,
          index: metaFiles.length,
        });
      });

      return metaFiles;
    },
  });

  // generate tabs tmp file
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      noPluginDir: true,
      path: TABS_META_PATH,
      content: Mustache.render(
        `{{#tabs}}
import * as tab{{{index}}} from '{{{file}}}';
{{/tabs}}

export const tabs = {
  {{#tabs}}
  '{{{id}}}': { key: '{{{key}}}', components: tab{{{index}}} },
  {{/tabs}}
}
`,
        { tabs },
      ),
    });
  });
};
