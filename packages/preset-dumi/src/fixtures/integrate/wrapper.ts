import type { IApi } from '@umijs/types';

/**
 * plugin for simulate @umijs/plugin-layout to wrap all routes
 */
export default (api: IApi) => {
  api.modifyRoutes(memo => {
    return [
      {
        path: '/',
        component: `(props) => props.children`,
        routes: memo,
      },
    ];
  });
}