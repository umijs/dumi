import type { IApi } from '@umijs/types';
import type { IDumiOpts } from '../../context';
import ctx, { setOptions } from '../../context';
import { prefix } from '../../routes/decorator/integrate';

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
    let menus: IDumiOpts['menus'];

    if (ctx.opts.isIntegrate && memo.menus) {
      // add integrate route prefix
      menus = {};
      Object.keys(memo.menus).forEach(key => {
        menus[prefix(key)] = memo.menus[key];
      });
    } else {
      // use user config
      menus = memo.menus;
    }
    setOptions('menus', menus);

    return memo;
  });
};
