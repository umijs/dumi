import type { IApi } from '@umijs/types';
import { setOptions } from '../../context';

export default (api: IApi) => {
  api.describe({
    key: 'mode',
    config: {
      default: 'doc',
      schema(joi) {
        return joi.equal('doc', 'site');
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('mode', memo.mode);

    return memo;
  });
};
