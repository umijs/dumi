import { logger } from '@umijs/utils';

export function printHelp() {
  const loggerPath = logger.getLatestLogFilePath();
  if (loggerPath) {
    logger.fatal('A complete log of this run can be found in:');
    logger.fatal(loggerPath);
  }
  logger.fatal(
    'Consider reporting a GitHub issue on https://github.com/umijs/dumi/issues',
  );
  // logger.fatal(FEEDBACK_MESSAGE);
}
