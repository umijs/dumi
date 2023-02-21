import type { IApi } from '@/types';
import { createRouteId } from '@umijs/core/dist/route/utils';
import path from 'path';
import { lodash, Mustache, winPath } from 'umi/plugin-utils';
import { TABS_META_PATH } from './meta';

export interface IContentTab {
  key: string;
  id?: string;
  test?: RegExp;
  title?: string;
  titleIntlId?: string;
  component: string;
}

export function isTabRouteFile(file: string) {
  return file.includes('$tab-');
}

export function getTabKeyFromFile(file: string) {
  return file.match(/\$tab-([^.]+)/)![1];
}

export function getHostForTabRouteFile(file: string) {
  return file.replace(/\$tab-[^.]+\./, '');
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
    title?: string;
    titleIntlId?: string;
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
      tab.id ??= `plugin-tab-${tab.key}`;
      tab.component = winPath(tab.component);
    });

    return memo;
  });

  // collect tabs from routes
  api.modifyRoutes((routes) => {
    tabs.length = 0;

    Object.values(routes).forEach((route) => {
      // remove $tab route from routes
      if (route.file && isTabRouteFile(route.file)) {
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
        if (!routesTabMapping[parentFile]?.includes(routeId)) {
          routesTabMapping[parentFile] ??= [];
          routesTabMapping[parentFile].push(routeId);
        }
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
      ...tabsFromPlugins.map((tab, index) => ({
        index: tabs.length + index,
        key: tab.key,
        id: tab.id!,
        title: tab.title || lodash.startCase(path.parse(tab.component).name),
        titleIntlId: tab.titleIntlId,
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
        const isFromPlugin = tabsFromPlugins.some((item) => item.id === tab.id);
        if (!isFromPlugin) {
          metaFiles.push({
            id: tab.id,
            file: tab.file,
            index: metaFiles.length,
          });
        }
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
  '{{{id}}}': { key: '{{{key}}}', title: '{{{title}}}', titleIntlId: '{{{titleIntlId}}}', components: tab{{{index}}} },
  {{/tabs}}
}
`,
        { tabs },
      ),
    });
  });
};
