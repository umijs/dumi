import type { IApi } from '@umijs/types';
import { setOptions } from '../../context';

/**
 * plugin for enable algolia search engine
 */
export default (api: IApi) => {
  api.describe({
    key: 'apiParser',
    config: {
      schema(joi) {
        return joi.object();
      },
      default: {},
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('apiParser', memo.apiParser);

    return memo;
  });
};
