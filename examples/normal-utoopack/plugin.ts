import { IApi } from '../..';

export default (api: IApi) => {
  api.addContentTab(() => ({
    key: 'test',
    component: require.resolve('./a.tsx'),
  }));
};
