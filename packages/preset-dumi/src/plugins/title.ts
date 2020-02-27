import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'title',
    config: {
      schema(joi) {
        return joi.string();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
};
