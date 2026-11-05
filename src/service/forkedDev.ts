import { setNodeTitle } from '@umijs/utils/dist/node';
import { logger, printHelp, setNoDeprecation, yParser } from 'umi/plugin-utils';
import { DEV_COMMAND, FRAMEWORK_NAME } from './constants';
import { DumiService } from './service';

type ShutdownSignal = 'SIGINT' | 'SIGQUIT' | 'SIGTERM';

setNodeTitle(`${FRAMEWORK_NAME}-dev`);
setNoDeprecation();

(async () => {
  let closed = false;

  try {
    const args = yParser(process.argv.slice(2));
    const service = new DumiService();
    let startup: ReturnType<DumiService['run2']>;
    let receivedSignal = false;
    const signalHandlers: Partial<Record<ShutdownSignal, () => void>> = {};

    async function shutdown(signal: ShutdownSignal) {
      if (closed) return;
      closed = true;

      const timeout = setTimeout(() => process.exit(1), 5000);
      timeout.unref();
      try {
        await startup.catch((error) => {
          logger.fatal(error);
          process.exitCode = 1;
        });

        // IPC does not dispatch the signal to other listeners in the worker.
        const cleanup = receivedSignal
          ? []
          : process
              .rawListeners(signal)
              .filter((listener) => listener !== signalHandlers[signal])
              .map(async (listener) => listener.call(process, signal));
        cleanup.push(
          Promise.resolve().then(() =>
            service.applyPlugins({ key: 'onExit', args: { signal } }),
          ),
        );

        for (const result of await Promise.allSettled(cleanup)) {
          if (result.status === 'rejected') {
            logger.fatal(result.reason);
            process.exitCode = 1;
          }
        }
        process.exit(process.exitCode || 0);
      } finally {
        clearTimeout(timeout);
      }
    }

    function onSignal(signal: ShutdownSignal) {
      receivedSignal = true;
      void shutdown(signal);
    }

    for (const signal of ['SIGINT', 'SIGQUIT', 'SIGTERM'] as const) {
      const handler = onSignal.bind(null, signal);
      signalHandlers[signal] = handler;
      process.on(signal, handler);
    }
    process.on(
      'message',
      (message?: { type?: string; payload?: { signal?: string } }) => {
        if (message?.type === 'SHUTDOWN') {
          const signal = message.payload?.signal;
          void shutdown(
            signal === 'SIGINT' || signal === 'SIGQUIT' ? signal : 'SIGTERM',
          );
        }
      },
    );
    process.once('disconnect', () => void shutdown('SIGTERM'));
    const { channel } = process as NodeJS.Process & {
      channel?: { unref(): void };
    };
    channel?.unref();

    startup = service.run2({ name: DEV_COMMAND, args });
    if (process.connected === false) void shutdown('SIGTERM');
    await startup;
  } catch (error) {
    if (closed) return;
    logger.fatal(error);
    printHelp.exit();
    process.exit(1);
  }
})();
