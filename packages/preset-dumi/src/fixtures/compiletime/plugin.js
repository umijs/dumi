import path from 'path';

export default (api) => {
  api.onPluginReady(() => {
    api.applyPlugins({
      type: api.ApplyPluginsType.event,
      key: 'dumi.registerCompiletime',
      args: {
        name: 'test',
        component: path.join(__dirname, 'previewer.js'),
        transformer: () => ({ props: { text: 'World!' }, dependencies: {} }),
      },
    });
  });
}