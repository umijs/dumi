import path from 'path';

export default {
  history: { type: 'memory' },
  mountElementId: '',
  chainWebpack(memo) {
    // compile linked dumi-theme-default
    memo.module.rule('js').include.add(path.join(__dirname, '../../../../theme-default'));
  }
}