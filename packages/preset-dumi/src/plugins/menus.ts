import { IApi } from 'umi';

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
