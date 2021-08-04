export { IDumiOpts } from './context';

export default () => {
  return {
    plugins: [
      // prepare plugin
      require.resolve('./plugins/features/init'),
      require.resolve('./plugins/features/theme'), // must before symlink to ensure correct alias order
      require.resolve('./plugins/features/symlink'),

      // config keys
      require.resolve('./plugins/features/logo'),
      require.resolve('./plugins/features/mode'),
      require.resolve('./plugins/features/description'),
      require.resolve('./plugins/features/locales'),
      require.resolve('./plugins/features/resolve'),
      require.resolve('./plugins/features/menus'),
      require.resolve('./plugins/features/navs'),
      require.resolve('./plugins/features/algolia'),
      require.resolve('./plugins/features/apiParser'),

      // site generate
      require.resolve('./plugins/features/routes'),
      require.resolve('./plugins/features/compile'),
      require.resolve('./plugins/features/sideEffects'),
      require.resolve('./plugins/features/404'),
      require.resolve('./plugins/features/sitemap'),

      // generate files
      require.resolve('./plugins/features/demo'),
      require.resolve('./plugins/features/config'),
      require.resolve('./plugins/features/api'),

      // integrate other umi plugins
      require.resolve('./plugins/features/extras'),

      // commands
      require.resolve('./plugins/commands/assets'),

      // for disable dumi
      require.resolve('./plugins/features/disable'),
    ],
  };
};
