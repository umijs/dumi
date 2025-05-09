import { IApi } from 'umi';

export default (api: IApi) => {
  console.log('dumi:plugin:internal'.repeat(10));

  api.modifyRoutes((oRoutes) => {
    // internal page
    oRoutes['dumi__internal'] = {
      id: 'dumi__internal',
      path: `__internal`,
      absPath: `/__internal`,
      parentId: void 0,
      file: require.resolve('../pages/_internal.tsx'),
    };

    return oRoutes;
  });
};
