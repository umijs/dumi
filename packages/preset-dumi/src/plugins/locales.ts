import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'locales',
    config: {
      schema(joi) {
        return joi.array();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
};
