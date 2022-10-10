import type { IApi } from '@/types';

export default (api: IApi) => {
  api.describe({ key: 'dumi-preset' });

  return {
    plugins: [
      require.resolve('./registerMethods'),

      require.resolve('./features/configPlugins'),
      require.resolve('./features/sideEffects'),
      require.resolve('./features/exports'),
      require.resolve('./features/compile'),
      require.resolve('./features/routes'),
      require.resolve('./features/meta'),
      require.resolve('./features/tabs'),
      require.resolve('./features/theme'),
      require.resolve('./features/locales'),
      require.resolve('./features/parser'),
    ],
  };
};
