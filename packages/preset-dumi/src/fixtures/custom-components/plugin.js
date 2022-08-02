import path from 'path';

export default (api) => {
  api.chainWebpack(memo => {
    // babel compile src folder
    memo.module.rule('js').include.add(path.join(__dirname, '../../..'));

    return memo;
  });
}