import path from 'path';

export default (api) => {
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'test.less',
      content: 'body[data-side-effects-test] { color: #fff; }',
    });
  });

  api.chainWebpack(memo => {
    // babel compile src folder
    memo.module.rule('js').include.add(path.join(__dirname, '../../..'));

    return memo;
  });
}