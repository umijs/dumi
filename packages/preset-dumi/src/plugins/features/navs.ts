import { IApi } from '@umijs/types';
import { setOptions } from '../../context';

export default (api: IApi) => {
  api.describe({
    key: 'navs',
    config: {
      schema(joi) {
        return joi.alternatives([joi.array(), joi.object()]);
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('navs', memo.navs);

    return memo;
  });
};
