import fs from 'fs';
import path from 'path';
import React from 'react';
import { IApi, IRoute } from '@umijs/types';
import getTheme from '../../theme/loader';
import { getDemoRouteName } from '../../theme/hooks/useDemoUrl';

interface ISingleRoutetDemos {
  [key: string]: {
    previewerProps: { [key: string]: any };
    component: React.ReactNode;
  };
}

export default (api: IApi) => {
  const demos: ISingleRoutetDemos = {};

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
  api.onGenerateFiles(async () => {
    const tpl = fs.readFileSync(path.join(__dirname, 'demos.mst'), 'utf-8');
    const groups: { [key: string]: any[] } = {};
    const items = Object.keys(demos).map(uuid => {
      const { componentName } = demos[uuid].previewerProps;
      let demoComponent = demos[uuid].component;

      // group demos module by component
      if (componentName) {
        groups[componentName] = (groups[componentName] || []).concat({
          uuid,
          component: demoComponent,
        });
        demoComponent = `require('./${componentName}').default['${uuid}'].component`;
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

    // write demos which belongs to component into a single module
    Object.entries(groups).forEach(([componentName, groupDemos]) => {
      api.writeTmpFile({
        path: `dumi/demos/${componentName}.ts`,
        content: api.utils.Mustache.render(tpl, { demos: groupDemos }),
      });
    });
  });

  // register demo detections
  api.register({
    key: 'dumi.detectDemo',
    fn({ uuid, code, previewerProps }) {
      demos[uuid] = {
        previewerProps,
        component: `React.memo(${code})`,
      };
    },
  });

  // add single demo render route
  api.modifyRoutes(async routes => {
    const theme = await getTheme();
    const prependRoutes: IRoute[] = [{ path: `/${getDemoRouteName()}/:uuid` }];
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

    prependRoutes[0].wrappers = [theme.layoutPaths.demo].filter(Boolean);
    prependRoutes[0].component = `(props) => {
      const React = require('react');
      const demos = require('@@/dumi/demos').default;
      const uuid = props.match.params.uuid;
      const inline = props.location.query.wrapper === undefined;
      const demo = demos[uuid];

      if (demo) {
        const previewerProps = {
          ...demo.previewerProps,
          // disallowed matryoshka
          hideActions: (demo.previewerProps.hideActions || []).concat(['EXTERNAL'])
        };

        if (props.location.query.capture !== undefined) {
          // unchain refer
          previewerProps.motions = (previewerProps.motions || []).slice();

          // unshift autoplay motion
          previewerProps.motions.unshift('autoplay');

          // append capture motion if not exist
          if (previewerProps.motions.every(motion => !motion.startsWith('capture'))) {
            // compatible with qiankun app
            previewerProps.motions.push('capture:[id|=root]');
          }
        }

        if (inline) {
          return React.createElement(() => {
            require('dumi/theme').useMotions(previewerProps.motions || [], document);

            return React.createElement('div', {}, React.createElement(demo.component));
          });
        } else {
          return React.createElement(
            require('${Previewer.source}').default,
            previewerProps,
            React.createElement(demo.component),
          );
        }
      }

      return \`Demo $\{uuid\} not found :(\`;
    }`;

    routes.unshift(...prependRoutes);

    return routes;
  });
};
