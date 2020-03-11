import { ApplyPluginsType } from '/Users/xiaohuoni/dumi/packages/dumi/node_modules/@umijs/runtime/dist/index.js';
import { plugin } from './plugin';

const routes = [
  {
    "path": "/",
    "component": (props) => require('react').createElement(require('/Users/xiaohuoni/dumi/packages/preset-dumi/lib/themes/default/layout.js').default, {
      ...{"menus":{"*":{"*":[{"path":"/","title":"Hello dumi!","meta":{}}]}},"locales":[],"navs":{},"title":"dumi","mode":"doc"},
      ...props,
    }),
    "routes": [
      {
        "path": "/",
        "component": require('../../docs/index.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/index.md",
          "updatedTime": 1583428882000,
          "fileCommits": [
            "9979be234d06ed4df0dd8f90ec3cd599c314b9f9",
            ""
          ],
          "slugs": [
            {
              "depth": 1,
              "value": "Hello dumi!",
              "heading": "hello-dumi"
            }
          ],
          "title": "Hello dumi!"
        },
        "title": "Hello dumi!"
      }
    ],
    "title": "dumi"
  }
];

// allow user to extend routes
plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export { routes };
