import { logger, setNoDeprecation, yParser } from '@umijs/utils';
import { DEV_COMMAND } from './constants';
import { dev } from './dev';
import { checkVersion as checkNodeVersion, setNodeTitle } from './node';
import { printHelp } from './printHelp';
import { DumiService } from './service';

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
      await new DumiService().run2({
        name: args._[0],
        args,
      });
    } catch (e: any) {
      logger.fatal(e);
      printHelp();
      process.exit(1);
    }
  }
}
