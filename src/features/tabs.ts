import type { IApi } from '@/types';
import { createRouteId } from '@umijs/core/dist/route/utils';
import path from 'path';
import { Mustache, winPath } from 'umi/plugin-utils';
import { TABS_META_PATH } from './meta';

export interface IContentTab {
  key: string;
  id?: string;
  test?: RegExp;
  component: string;
}

export function isTabRouteFile(file?: string) {
  return file?.includes('$tab-');
}

export function getTabKeyFromFile(file: string) {
  return file.match(/\$tab-([^.]+)/)![1];
}

/**
 * plugin for add conventional tab and plugin tab into page content
 */
export default (api: IApi) => {
  let tabsFromPlugins: IContentTab[];
  const routesTabMapping: Record<string, string[]> = {};
  const tabs: {
    index: number;
    key: string;
    id: string;
    file: string;
  }[] = [];

  api.describe({ key: undefined });

  // collect extra content tabs before routes generate
  // why in `modifyConfig`? It will be called before `modifyRoutes`
  api.modifyConfig(async (memo) => {
    // allow add extra tabs
    tabsFromPlugins = await api.applyPlugins({
      key: 'addContentTab',
    });

    // generate id for tabs
    tabsFromPlugins.forEach((tab) => {
      tab.id ??= `plugin-tab${tab.test ? `-${tab.test}` : ''}-${tab.key}`;
    });

    return memo;
  });

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
          id: routeId,
          file: route.file,
        });
        routesTabMapping[parentFile] ??= [];
        routesTabMapping[parentFile].push(routeId);
      } else {
        // apply plugin tabs for normal routes
        tabsFromPlugins.forEach((tab) => {
          if (
            (!tab.test || route.absPath.match(tab.test)) &&
            !routesTabMapping[route.file]?.includes(tab.id!)
          ) {
            routesTabMapping[route.file] ??= [];
            routesTabMapping[route.file].push(tab.id!);
          }
        });
      }
    });

    // append plugin tabs
    tabs.push(
      ...tabsFromPlugins.map((tab) => ({
        index: tabs.length,
        key: tab.key,
        id: tab.id!,
        file: tab.component,
      })),
    );

    return routes;
  });

  // append tabs to meta files
  api.register({
    key: 'dumi.modifyMetaFiles',
    fn: (metaFiles: any) => {
      // add related tabs to meta files
      Object.values(metaFiles).forEach((metaFile: any) => {
        if (routesTabMapping[metaFile.file]) {
          metaFile.tabs = JSON.stringify(routesTabMapping[metaFile.file]);
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
