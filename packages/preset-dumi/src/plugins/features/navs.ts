import type { IApi } from '@umijs/types';
import type { IDumiOpts } from '../../context';
import ctx, { setOptions } from '../../context';
import { prefix } from '../../routes/decorator/integrate';
import type { INavItem } from '../../routes/getNavFromRoutes';

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
    let navs: IDumiOpts['navs'];

    function navPrefix(items: INavItem[]) {
      return items.map(item =>
        // compatible with null item
        item
          ? {
              ...item,
              path: /^(\w+:)?\/\/|^(mailto|tel):/.test(item.path) ? item.path : prefix(item.path),
              children: item.children ? navPrefix(item.children) : item.children,
            }
          : item,
      );
    }

    if (ctx.opts.isIntegrate && memo.navs) {
      // add integrate route prefix
      if (Array.isArray(memo.navs)) {
        // process single locale navs
        navs = navPrefix(memo.navs);
      } else {
        // process multiple locales navs
        navs = {};
        Object.keys(memo.navs).forEach(locale => {
          navs[locale] = navPrefix(memo.navs[locale]);
        });
      }
    } else {
      // use user config
      navs = memo.navs;
    }
    setOptions('navs', navs);

    return memo;
  });
};
