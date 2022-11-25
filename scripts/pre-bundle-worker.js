const path = require('path');
const { build } = require('@umijs/bundler-utils/compiled/esbuild');

// use esbuild to pre-bundle worker
// why not ncc?
// because it only works for Node.js package
build({
  entryPoints: ['src/client/theme-api/useSiteSearch/searchWorker'],
  absWorkingDir: path.dirname(__dirname),
  outfile: 'compiled/_internal/searchWorker.min.js',
  bundle: true,
  minify: true,
  logLevel: 'silent',
  target: 'es6',
  format: 'iife',
});
