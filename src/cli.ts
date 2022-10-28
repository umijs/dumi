import { chalk, logger } from 'umi/plugin-utils';
import { run } from './service/cli';

(async () => {
  try {
    logger.info(chalk.cyan.bold(`dumi v${require('../package').version}`));
    await run({
      presets: [require.resolve('./preset')],
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
