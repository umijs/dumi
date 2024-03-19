import { getDepVersion, hasDep } from '@/shared';
import { compare } from 'compare-versions';
import type { IApi } from 'dumi';
import { chalk, logger } from 'dumi/plugin-utils';

export default function checkVersion(api: IApi) {
  const vueVersion = getDepVersion({
    pkg: api.pkg,
    cwd: api.cwd,
    dep: 'vue',
  });

  if (!vueVersion) {
    throw new Error('Please install Vue.');
  }
  logger.info(chalk.cyan.bold(`Vue v${vueVersion}`));

  // before 3.3.6 vue/compiler-sfc will register typscript in browser
  // @vue/compiler-sfc will not register typescript
  const shouldInstallCompiler = compare(vueVersion, '3.3.6', '<');
  const hasOwnCompiler = hasDep(api.pkg, '@vue/compiler-sfc');

  if (shouldInstallCompiler && !hasOwnCompiler) {
    throw new Error(`Please install @vue/compiler-sfc v${vueVersion}`);
  }

  if (shouldInstallCompiler) {
    api.modifyConfig((memo) => {
      memo.alias = {
        ...memo.alias,
        'vue/compiler-sfc': '@vue/compiler-sfc',
      };
      return memo;
    });
  }
}
