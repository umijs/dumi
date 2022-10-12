import type { IApi } from './types';

export default (api: IApi) => {
  api.describe({ key: 'dumi:registerMethods' });

  ['registerTechStack', 'addContentTab'].forEach((name) => {
    api.registerMethod({ name });
  });
};
