import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'logo',
    config: {
      schema(joi) {
        return joi.string();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
};
