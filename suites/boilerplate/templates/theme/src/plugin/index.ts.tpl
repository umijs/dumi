import type { IApi } from 'dumi';

export default (api: IApi) => {
  api.describe({ key: `dumi-theme:${require('../../package.json').name}` });
  // TODO: add your plugin code here
};
