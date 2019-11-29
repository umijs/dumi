const { fork } = require('child_process');

module.exports = () => {
  process.env.PAGES_PATH = 'src';
  process.env.UMI_PLUGINS = require.resolve('umi-plugin-father-doc');

  // start umi use child process
  const child = fork(
    require.resolve('umi/bin/umi'),
    [...(process.argv.slice(2) || [])],
    {
      stdio: 'inherit'
    },
  );

  // handle exit signals
  child.on('exit', (code, signal) => {
    if (signal === 'SIGABRT') {
      process.exit(1);
    }

    process.exit(code);
  });

  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
}

