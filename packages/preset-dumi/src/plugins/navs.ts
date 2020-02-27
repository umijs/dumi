import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'navs',
    config: {
      schema(joi) {
        return joi.alternatives([joi.array(), joi.object()]);
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
};
