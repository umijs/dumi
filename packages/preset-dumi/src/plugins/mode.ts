import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'mode',
    config: {
      schema(joi) {
        return joi.string();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
};
