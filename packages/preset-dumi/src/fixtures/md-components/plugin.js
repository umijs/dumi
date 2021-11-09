import path from "path";

export default (api) => {
  api.chainWebpack(memo => {
    // babel compile src folder
    memo.module.rule('js').include.add(path.join(__dirname, '../../..'));

    return memo;
  });
  
  api.register({
    key: "dumi.registerMdComponent",
    fn: () => ({
      name: "Test",
      component: path.join(__dirname, "Test.js"),
      compiler(node, i, parent, vFile) {
        node._dumi_parsed = true;
      },
    }),
  });
};
