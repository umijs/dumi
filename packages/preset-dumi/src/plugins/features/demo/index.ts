import fs from 'fs';
import path from 'path';
import type { IApi, IRoute } from '@umijs/types';
import { createDebug } from '@umijs/utils';
import getTheme from '../../../theme/loader';
import { getDemoRouteName } from '../../../theme/hooks/useDemoUrl';
import { decodeRawRequire } from '../../../transformer/utils';

const debug = createDebug('dumi:demos');

type ISingleRoutetDemos = Record<
  string,
  {
    previewerProps: Record<string, any>;
    component: string;
  }
>;

export default (api: IApi) => {
  const demos: ISingleRoutetDemos = {};
  const generateDemosFile = api.utils.lodash.debounce(async () => {
    const tpl = fs.readFileSync(path.join(__dirname, 'demos.mst'), 'utf8');
    const items = Object.keys(demos).map(uuid => {
      const { componentName } = demos[uuid].previewerProps;
      // collect component related module (react component & source code) into one chunk
      const chunkName =
        (componentName &&
          `demos_${[...componentName]
            // reverse component name to avoid some special component (such as Advertisement) be blocked by ADBlock when dynamic loading
            .reverse()
            .join('')}`) ||
        'demos_no_comp';
      let demoComponent = demos[uuid].component;

      // replace to dynamic component for await import component
      if (demoComponent.startsWith('(await import(')) {
        demoComponent = `dynamic({
      loader: async () => ${decodeRawRequire(demoComponent, chunkName)},
      loading: () => null,
    })`;
      }

      return {
        uuid,
        component: demoComponent,
        previewerProps: decodeRawRequire(JSON.stringify(demos[uuid].previewerProps), 'dumi_raw_source_code'),
      };
    });

    // write demos entry file
    api.writeTmpFile({
      path: 'dumi/demos/index.ts',
      content: api.utils.Mustache.render(tpl, { demos: items }),
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
