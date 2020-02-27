import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'resolve',
    config: {
      default: {},
      schema(joi) {
        return joi.object();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
};
