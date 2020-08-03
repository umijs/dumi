import path from 'path';
import React from 'react';
import { IApi } from '@umijs/types';

interface ISingleRoutetDemos {
  [key: string]: {
    previewerProps: { [key: string]: any };
    component: React.ReactNode;
  };
}

export default (api: IApi) => {
  const demos: ISingleRoutetDemos = {};

  // write all demos into .umi dir
  api.onGenerateFiles(() => {
    const items = Object.keys(demos).map(
      uuid => ` '${uuid}': {
    previewerProps: ${JSON.stringify(demos[uuid].previewerProps)},
    component: ${demos[uuid].component},
  },`,
    );

    api.writeTmpFile({
      path: 'dumi/demos.ts',
      content: `import React from 'react';
export default {
  ${items.join('\n')}
}`,
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
  api.modifyRoutes(routes => {
    routes.unshift(
      {
        path: '/~demos/:uuid',
        component: `(props) => {
          const demos = require('@@/dumi/demos').default;
          const uuid = props.match.params.uuid;
          const inline = props.location.query.wrapper === undefined;
          const demo = demos[uuid];

          if (demo) {
            return require('react').createElement(
              require('${path.join(
                __dirname,
                '../../themes/default/builtins/Previewer.js',
              )}').default,
              {
                ...demo.previewerProps,
                inline,
                // disallowed matryoshka
                hideActions: (demo.previewerProps.hideActions || []).concat(['EXTERNAL'])
              },
              require('react').createElement(demo.component),
            );
          }

          return \`Demo $\{uuid\} not found :(\`;
        }`,
      },
      // compatible 1.0 _demos/:name usage
      {
        path: '/_demos/:uuid',
        redirect: '/~demos/:uuid',
      },
    );

    return routes;
  });
};
