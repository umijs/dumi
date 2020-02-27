import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'menus',
    config: {
      schema(joi) {
        return joi.object();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
};
