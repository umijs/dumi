// @ts-ignore
import { Navigate } from 'dumi';
import React from 'react';

export const patchClientRoutes = ({ routes }: any) => {
  /**
   * redirect all legacy zh-CN routes to root
   */
  routes[0].children.push({
    id: 'zh-cn-redirect',
    path: 'zh-CN/*',
    element: <Navigate to="/" />,
  });

  return routes;
};
