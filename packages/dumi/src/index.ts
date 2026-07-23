const { fork } = require('child_process');

module.exports = () => {
  process.env.UMI_PRESETS = require.resolve('@umijs/preset-dumi');

  const cliArgs = process.argv.slice(2) || [];
  const shouldPrintUtoopackAd = cliArgs[0] === 'dev' && process.env.MAKO_AD !== 'none';

  // Umi 3 promotes Mako during dev, but dumi 2 supports utoopack instead.
  process.env.MAKO_AD = 'none';
  if (shouldPrintUtoopackAd) {
    process.stdout.write(
      'Utoopack https://github.com/utooland/utoo is a fast Rust-based bundler for dumi 2. Upgrade to dumi 2 and enable it with `utoopack: {}`. Visit https://d.umijs.org/config#utoopack for more details.\n',
    );
  }

  // start umi use child process
  const child = fork(require.resolve('umi/bin/umi'), cliArgs, {
    stdio: 'inherit',
  });

  // handle exit signals
  child.on('exit', (code, signal) => {
    if (signal === 'SIGABRT') {
      process.exit(1);
    }

    process.exit(code);
  });

  // for e2e test
  child.on('message', args => {
    if (process.send) {
      process.send(args);
    }
  });

  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
};
