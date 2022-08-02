import fs from 'fs';
import path from 'path';
import type { IApi, IRoute } from '@umijs/types';
import { createDebug } from '@umijs/utils';
import getTheme from '../../../theme/loader';
import { getDemoRouteName } from '../../../theme/hooks/useDemoUrl';
import {
  decodeImportRequireWithAutoDynamic,
  isDynamicEnable,
  isHoistImport,
  decodeHoistImport,
} from '../../../transformer/utils';

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
    // must start with 1 instead of 0 (falsy value), otherwise, rawCode0 could be override by rawCode1 when rawCode0 and rawCode1 is the same importation.
    let hoistImportCount = 1;
    const hoistImports: Record<string, number> = {};
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
      const itemHoistImports: Record<string, number> = {};
      let demoComponent = demos[uuid].component;

      // replace to dynamic component for await import component
      demoComponent = decodeImportRequireWithAutoDynamic(demoComponent, chunkName);

      // hoist all raw code import statements
      Object.entries(demos[uuid].previewerProps.sources).forEach(
        ([file, oContent]: [string, any]) => {
          const content = file === '_' ? Object.values(oContent)[0] : oContent.content;

          if (isHoistImport(content)) {
            if (!hoistImports[content]) {
              hoistImports[content] = hoistImportCount;
              hoistImportCount += 1;
            }

            itemHoistImports[content] = hoistImports[content];
          }
        },
      );

      // replace collected import statments to rawCode var
      const previewerPropsStr = Object.entries(itemHoistImports).reduce(
        (str, [stmt, no]) =>
          str.replace(
            new RegExp(`"${stmt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
            `rawCode${no}`,
          ),
        JSON.stringify(demos[uuid].previewerProps),
      );

      return {
        uuid,
        component: demoComponent,
        previewerProps: previewerPropsStr,
      };
    });

    // write demos entry file
    api.writeTmpFile({
      path: 'dumi/demos/index.ts',
      content: api.utils.Mustache.render(tpl, {
        demos: items,
        rawCodes: Object.entries(hoistImports).map(([stmt, no]) =>
          decodeHoistImport(stmt, `rawCode${no}`),
        ),
      }),
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
        path: `/${getDemoRouteName()}/:uuid${
          api.config.exportStatic && api.config.exportStatic.htmlSuffix ? '.html' : ''
        }`,
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

    const demoRenderBody = `
      const { demos } = React.useContext(context);
      const [renderArgs, setRenderArgs] = React.useState([]);

      // update render args when props changed
      React.useLayoutEffect(() => {
        setRenderArgs(getDemoRenderArgs(props, demos));
      }, [props.match.params.uuid, props.location.query.wrapper, props.location.query.capture]);

      // for listen prefers-color-schema media change in demo single route
      usePrefersColor();

      switch (renderArgs.length) {
        case 1:
          // render demo directly
          return renderArgs[0];

        case 2:
          // render demo with previewer
          return React.createElement(
            Previewer,
            renderArgs[0],
            renderArgs[1],
          );

        default:
          return \`Demo $\{props.match.params.uuid\} not found :(\`;
      }
    `;
    const demoRouteComponent = isDynamicEnable()
      ? `dynamic({
          loader: async () => {
            const React = await import('react');
            const { default: getDemoRenderArgs } = await import(/* webpackChunkName: 'dumi_demos' */ '${api.utils.winPath(
              path.join(__dirname, './getDemoRenderArgs'),
            )}');
            const { default: Previewer } = await import(/* webpackChunkName: 'dumi_demos' */ '${
              Previewer.source
            }');
            const { usePrefersColor, context } = await import(/* webpackChunkName: 'dumi_demos' */ 'dumi/theme');

            return props => {
              ${demoRenderBody}
            }
          },
          loading: () => null,
        }))(` // hack to execute and return dynamic, to avoid use React.createElement and can works with umi routeToJSON
      : `{
        const React = require('react');
        const { default: getDemoRenderArgs } = require('${api.utils.winPath(
          path.join(__dirname, './getDemoRenderArgs'),
        )}');
        const { default: Previewer } = require('${Previewer.source}');
        const { usePrefersColor, context } = require('dumi/theme');

        ${demoRenderBody}
        }`;

    prependRoutes[0].wrappers = [
      // builtin outer layout for initialize context (.umi/dumi/layout.tsx)
      '../dumi/layout',
      theme.layoutPaths.demo,
    ].filter(Boolean);
    prependRoutes[0].component = `((props) => ${demoRouteComponent})`;

    routes.unshift(...prependRoutes);

    return routes;
  });

  // export static for dynamic demos
  api.modifyExportRouteMap(memo => {
    const exportStatic = api.config.exportStatic;
    if (exportStatic) {
      memo.push(
        ...Object.keys(demos).map(uuid => {
          const demoRoutePath = `/${getDemoRouteName()}/${uuid}`;
          return {
            route: { path: demoRoutePath },
            file: `${demoRoutePath}${exportStatic.htmlSuffix ? '' : '/index'}.html`,
          };
        }),
      );

      /* istanbul ignore if */
      if (api.utils.isWindows) {
        // do not generate dynamic route file for Windows, to avoid throw error
        memo = memo.filter(item => !item.route.path.includes('/:'));
      }
    }
    return memo;
  });
};
