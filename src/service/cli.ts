import {
  catchUnhandledRejection,
  checkVersion as checkNodeVersion,
  setNodeTitle,
} from '@umijs/utils/dist/node';
import { logger, setNoDeprecation, yParser } from 'umi/plugin-utils';
import { DEV_COMMAND, FRAMEWORK_NAME, MIN_NODE_VERSION } from './constants';
import { dev } from './dev';
import { printHelp } from './printHelp';
import { DumiService } from './service';

interface IOpts {
  presets?: string[];
}

catchUnhandledRejection();

export async function run(opts?: IOpts) {
  checkNodeVersion(MIN_NODE_VERSION);
  setNodeTitle(FRAMEWORK_NAME);
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

  // disable Umi did you know
  process.env.DID_YOU_KNOW = 'none';

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
