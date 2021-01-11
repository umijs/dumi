import type { IApi } from '@umijs/types';
import { setOptions } from '../../context';

export default (api: IApi) => {
  api.describe({
    key: 'locales',
    config: {
      default: [
        ['en-US', 'English'],
        ['zh-CN', '中文'],
      ],
      schema(joi) {
        return joi
          .array()
          .min(1)
          .items(
            joi
              .array()
              .length(2)
              .items(joi.string()),
          );
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('locales', memo.locales);

    return memo;
  });
};
