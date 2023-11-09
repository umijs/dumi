import type { IApi } from 'umi';

import VueJSXTechStack from './jsx';
import VueSfcTechStack from './sfc';

export default function registerTechStack(api: IApi) {
  api.register({
    key: 'registerTechStack',
    stage: 0,
    fn: () => new VueJSXTechStack(),
  });

  api.register({
    key: 'registerTechStack',
    stage: 1,
    fn: () => new VueSfcTechStack(),
  });
}
