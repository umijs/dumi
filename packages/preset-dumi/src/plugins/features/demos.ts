import React from 'react';
import { IApi } from '@umijs/types';
import getTheme from '../../theme/loader';

interface ISingleRoutetDemos {
  [key: string]: {
    previewerProps: { [key: string]: any };
    component: React.ReactNode;
  };
}

export default (api: IApi) => {
  const demos: ISingleRoutetDemos = {};

  // write all demos into .umi dir
  api.onGenerateFiles(async () => {
    const items = Object.keys(demos).map(
      uuid => ` '${uuid}': {
    previewerProps: ${JSON.stringify(demos[uuid].previewerProps)},
    component: ${demos[uuid].component},
  },`,
    );

    let builtins =
      (await api.applyPlugins({
        key: 'dumi.modifyThemeBuiltins',
        type: api.ApplyPluginsType.modify,
        initialValue: [],
      })) || [];

    api.writeTmpFile({
      path: 'dumi/demos.ts',
      content: `import React from 'react';
${builtins
  .map(component => `import ${component.identifier} from '${component.source}';`)
  .join('\n')}
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
  api.modifyRoutes(async routes => {
    const theme = await getTheme();
    const Previewer = theme.builtins
      .concat(theme.fallbacks)
      .find(({ identifier }) => identifier === 'Previewer');

    routes.unshift(
      {
        path: '/~demos/:uuid',
        component: `(props) => {
          const react = require('react');
          const demos = require('@@/dumi/demos').default;
          const uuid = props.match.params.uuid;
          const inline = props.location.query.wrapper === undefined;
          const demo = demos[uuid];

          if (demo) {
            if (inline) {
              return react.createElement(demo.component);
            } else {
              return react.createElement(
                require('${Previewer.source}').default,
                {
                  ...demo.previewerProps,
                  // disallowed matryoshka
                  hideActions: (demo.previewerProps.hideActions || []).concat(['EXTERNAL'])
                },
                react.createElement(demo.component),
              );
            }
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
