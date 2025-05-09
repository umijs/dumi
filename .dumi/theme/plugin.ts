import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyRoutes((oRoutes) => {
    // internal page
    oRoutes['dumi__internal'] = {
      id: 'dumi__internal',
      path: `__internal`,
      absPath: `/__internal`,
      parentId: void 0,
      file: require.resolve('../pages/__internal.tsx'),
    };

    return oRoutes;
  });
};
