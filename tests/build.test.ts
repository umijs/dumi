import path from 'path';
import { execa } from 'umi/plugin-utils';

test('build', () => {
  const bin = require.resolve('../bin/dumi');

  execa.execaSync('node', [bin, 'build'], {
    cwd: path.join(__dirname, '../examples/normal'),
  });
});
