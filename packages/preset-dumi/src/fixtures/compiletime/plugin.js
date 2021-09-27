import path from 'path';

export default (api) => {
  api.register({
    key: 'dumi.registerCompiletime',
    fn: () => ({
      name: 'test',
      component: path.join(__dirname, 'previewer.js'),
      transformer: () => ({
        rendererProps: { text: 'World!' },
        previewerProps: {
          sources: { _: { path: path.join(__dirname, 'demo.js') } },
          dependencies: {},
        },
      }),
    }),
  });
}