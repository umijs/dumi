import type { IApi } from '@/types';
import fs from 'fs';
import path from 'path';
import { logger } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({ key: 'dumi-preset' });

  const legacyConfig = [
    '.umirc.ts',
    '.umirc.js',
    'config/config.ts',
    'config/config.js',
  ].find((file) => fs.existsSync(path.join(api.cwd, file)));

  if (legacyConfig) {
    logger.warn(
      `Detected you are using legacy config file \`${legacyConfig}\`, it will no longer be loaded, please migrate to the new \`.dumirc.ts\` file, and the tmp file also from \`.umi\` to \`.dumi/tmp\`, please update related files such as \`.gitignore\`, \`tsconfig.json\` & etc.`,
    );
    logger.warn(
      `检测到你在使用旧配置文件 \`${legacyConfig}\`，它已不再生效，请将内容迁移到新的 \`.dumirc.ts\` 配置文件中，另外临时文件夹也从 \`.umi\` 迁移到 \`.dumi/tmp\`，请同时更新相关文件如 \`.gitignore\`、\`tsconfig.json\` 等`,
    );
  }

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
      require.resolve('./features/assets'),
    ],
  };
};
