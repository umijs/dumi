import fs from 'fs';
import { IApi } from '@umijs/types';
import { init, setOptions } from '../../context';

/**
 * dumi prepare plugin
 */
export default (api: IApi) => {
  // init context & share umi api with other source module
  init(api, {} as any);

  // use modifyConfig api for update context
  // because both of the umi service init & user config changed will trigger this plugin key
  api.modifyConfig(memo => {
    // share config with other source module via context
    setOptions('title', memo.title || api.pkg.name || 'dumi');

    return {
      ...memo,
      // pass empty routes if pages path does not exist and no routes config
      // to avoid umi throw src directory not exists error
      routes: fs.existsSync(api.paths.absSrcPath) && !api.userConfig.routes ? undefined : [],
    };
  });
};
