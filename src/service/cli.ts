import { logger, printHelp, setNoDeprecation, yParser } from '@umijs/utils';
import { Service } from 'umi';
import { DEFAULT_CONFIG_FILES, DEV_COMMAND, FRAMEWORK_NAME } from './constants';
import { dev } from './dev';
import { checkVersion as checkNodeVersion, setNodeTitle } from './node';

interface IOpts {
  presets?: string[];
}

export async function run(opts?: IOpts) {
  checkNodeVersion();
  setNodeTitle();
  setNoDeprecation();

  const args = yParser(process.argv.slice(2), {
    alias: {
      version: ['v'],
      help: ['h'],
    },
    boolean: ['version'],
  });
  const command = args._[0];
  if ([DEV_COMMAND, 'setup'].includes(command)) {
    process.env.NODE_ENV = 'development';
  } else if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  if (opts?.presets) {
    process.env.DUMI_PRESETS = opts.presets.join(',');
  }
  if (command === DEV_COMMAND) {
    dev();
  } else {
    try {
      await new Service({
        defaultConfigFiles: DEFAULT_CONFIG_FILES,
        frameworkName: FRAMEWORK_NAME,
      }).run2({
        name: args._[0],
        args,
      });
    } catch (e: any) {
      logger.fatal(e);
      // TODO 这里需要输出 dumi 自己的错误
      printHelp.exit();
      process.exit(1);
    }
  }
}
