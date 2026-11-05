import type { ChildProcess } from 'child_process';
import { once } from 'events';
import fork from 'umi/dist/cli/fork';
import { logger } from 'umi/plugin-utils';

// Umi < 4.7.25 returns the child directly.
type DevProcess =
  | ChildProcess
  | {
      readonly child: ChildProcess;
      stop(signal: NodeJS.Signals): Promise<void>;
    };

export function dev() {
  const devProcess = fork({
    scriptPath: require.resolve('../../bin/forkedDev'),
  }) as DevProcess;
  let stopping = false;

  async function shutdown(signal: NodeJS.Signals, exitCode: number) {
    if (stopping) return;
    stopping = true;

    try {
      let child: ChildProcess;
      if ('stop' in devProcess) {
        await devProcess.stop(signal);
        child = devProcess.child;
      } else {
        child = devProcess;
        if (child.exitCode === null && child.signalCode === null) {
          child.kill(signal);
          await once(child, 'exit');
        }
      }
      process.exit(
        child.exitCode || (child.signalCode === 'SIGKILL' ? 1 : exitCode),
      );
    } catch (error) {
      logger.fatal(error);
      process.exit(1);
    }
  }

  process.on('SIGINT', () => void shutdown('SIGINT', 0));
  process.on('SIGTERM', () => void shutdown('SIGTERM', 1));
}
