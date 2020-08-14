import path from 'path';

export default {
  chainWebpack(config) {
    // load dumi-default-theme for testing
    config.module.rule('js').include.add(path.join(__dirname, '../../../theme-default'));
  },
};
