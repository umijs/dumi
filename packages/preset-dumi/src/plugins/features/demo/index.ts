import fs from 'fs';
import path from 'path';
import type React from 'react';
import type { IApi, IRoute } from '@umijs/types';
import { createDebug } from '@umijs/utils';
import getTheme from '../../../theme/loader';
import { getDemoRouteName } from '../../../theme/hooks/useDemoUrl';

const debug = createDebug('dumi:demos');

type ISingleRoutetDemos = Record<string, {
    previewerProps: Record<string, any>;
    component: React.ReactNode;
  }>;

export default (api: IApi) => {
  const demos: ISingleRoutetDemos = {};
  const generateDemosFile = api.utils.lodash.debounce(async () => {
    const tpl = fs.readFileSync(path.join(__dirname, 'demos.mst'), 'utf8');
    const groups: Record<string, any[]> = {};
    const items = Object.keys(demos).map(uuid => {
      const { componentName } = demos[uuid].previewerProps;
      let demoComponent = demos[uuid].component;

      // dynamic import demos for performance if it is belongs to some component
      if (componentName) {
        groups[componentName] = (groups[componentName] || []).concat({
          uuid,
          component: demoComponent,
        });
        demoComponent = `() => React.createElement(dynamic({
      loader: async function() {
        const { default: demos } = await import(/* webpackChunkName: "demos_${[...componentName]
          // reverse component name to avoid some special component (such as Advertisement) be blocked by ADBlock when dynamic loading
          .reverse()
          .join('')}" */'./${componentName}');

        return demos['${uuid}'].component;
      },
      loading: () => null,
    }))`;
      }

      return {
        uuid,
        component: demoComponent,
        previewerProps: JSON.stringify(demos[uuid].previewerProps),
      };
    });

    // write demos entry file
    api.writeTmpFile({
      path: 'dumi/demos/index.ts',
      content: api.utils.Mustache.render(tpl, { demos: items, isDemoEntry: true }),
    });

    // write demos which belongs to component into a single module for dynamic import
    Object.entries(groups).forEach(([componentName, groupDemos]) => {
      api.writeTmpFile({
        path: `dumi/demos/${componentName}.ts`,
        content: api.utils.Mustache.render(tpl, { demos: groupDemos }),
      });
    });

    debug('.dumi/demos files generated');
  });

  // pass platform env
  if (process.env.PLATFORM_TYPE) {
    api.modifyDefaultConfig(memo => {
      memo.define = Object.assign(memo.define || {}, {
        'process.env.PLATFORM_TYPE': process.env.PLATFORM_TYPE,
      });

      return memo;
    });
  }

  // write all demos into .umi dir
  api.onGenerateFiles(generateDemosFile);

  // register demo detections
  api.register({
    key: 'dumi.detectDemo',
    fn({ uuid, code, previewerProps }) {
      const isUpdating = Boolean(demos[uuid]);

      demos[uuid] = {
        previewerProps,
        component: code,
      };

      if (isUpdating) {
        generateDemosFile();
      }
    },
  });

  // add single demo render route
  api.modifyRoutes(async routes => {
    const theme = await getTheme();
    const prependRoutes: IRoute[] = [
      {
        path: `/${getDemoRouteName()}/:uuid`,
        // use to disable pro-layout in integrated mode
        layout: false,
      },
    ];
    const Previewer = theme.builtins
      .concat(theme.fallbacks)
      .find(({ identifier }) => identifier === 'Previewer');

    // both compatible with dumi 1.0 & Basement
    /* istanbul ignore else */
    if (prependRoutes[0].path !== '/_demos/:uuid') {
      prependRoutes.push({
        path: '/_demos/:uuid',
        redirect: '/~demos/:uuid',
      });
    }

    prependRoutes[0].wrappers = [
      // builtin outer layout, for initialize context
      api.utils.winPath(path.join(__dirname, '../../../theme/layout')),
      theme.layoutPaths.demo,
    ].filter(Boolean);
    prependRoutes[0].component = `(props) => {
      const React = require('react');
      const renderArgs = require('${api.utils.winPath(
        path.relative(
          path.join(api.paths.absTmpPath, 'core'),
          path.join(__dirname, './getDemoRenderArgs'),
        ),
      )}').default(props);

      switch (renderArgs.length) {
        case 1:
          // render demo directly
          return renderArgs[0];

        case 2:
          // render demo with previewer
          return React.createElement(
            require('${Previewer.source}').default,
            renderArgs[0],
            renderArgs[1],
          );

        default:
          return \`Demo $\{uuid\} not found :(\`;
      }
    }`;

    routes.unshift(...prependRoutes);

    return routes;
  });
};
