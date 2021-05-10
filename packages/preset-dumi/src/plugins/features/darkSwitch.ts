import type { IApi } from '@umijs/types';
import { setOptions } from '../../context';

export default (api: IApi) => {
  api.describe({
    key: 'darkSwitch',
    config: {
      schema(joi) {
        return joi.boolean();
      },
      default: true,
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('darkSwitch', memo.darkSwitch);

    return memo;
  });
}
