import path from 'path';

export default (api) => {
  api.register({
    key: 'dumi.registerCompiletime',
    fn: () => ({
      name: 'test',
      component: path.join(__dirname, 'previewer.js'),
      transformer: () => ({ props: { text: 'World!' }, dependencies: {} }),
    }),
  });
}