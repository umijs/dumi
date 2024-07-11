import { execa } from '@umijs/utils';
import path from 'path';
import { getExamples, getPublishPackages } from './miscUtil';

const rootPath = path.join(__dirname, '..');

function main() {
  // https://github.com/stackblitz-labs/pkg.pr.new
  const params = [
    'publish',
    // packages
    ...getPublishPackages().map((pkg) => pkg.path),
    // template
    ...getExamples().map((example) => `--template=${example.path}`),
    // more options
    '--pnpm',
  ];

  console.log('🚀 pkg-pr-new', params);

  execa.execaSync(
    'npx',
    ['-p @wuxh/pkg-pr-new@0.0.15-fork.1', 'pkg-pr-new', '', ...params],
    {
      stdio: 'inherit',
      cwd: rootPath,
    },
  );
}

// \\\\\\\\\\\
//  \\\ main \\
//   \\\\\\\\\\\
main();
