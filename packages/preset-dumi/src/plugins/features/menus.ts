import { IApi } from '@umijs/types';
import { setOptions } from '../../context';

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

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('menus', memo.menus);

    return memo;
  });
};
