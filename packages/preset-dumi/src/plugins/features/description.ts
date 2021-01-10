import type { IApi } from '@umijs/types';
import { setOptions } from '../../context';

export default (api: IApi) => {
  api.describe({
    key: 'description',
    config: {
      schema(joi) {
        return joi.string();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('description', memo.description);

    return memo;
  });
};
