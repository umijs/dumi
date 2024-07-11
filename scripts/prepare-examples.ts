import { fsExtra } from '@umijs/utils';
import path from 'path';
import { getExamples } from './miscUtil';

const rootPath = path.join(__dirname, '..');

function modifyPackageJson(pkgJson: any) {
  return Object.assign({}, pkgJson, {
    scripts: {
      // ...pkgJson.scripts, // ignore original scripts
      dev: 'dumi dev',
      start: 'npm run dev',
      build: 'dumi build',
      preview: 'dumi preview',
      setup: 'dumi setup',
    },
    dependencies: {
      ...pkgJson.dependencies,
      dumi: 'workspace:*',
    },
  });
}

function main() {
  for (const example of getExamples()) {
    // const pkgJson = require(example);
    const pkgJson = fsExtra.readJSONSync(
      path.join(example.path, 'package.json'),
    );
    const newPkgJson = modifyPackageJson(pkgJson);

    const rewritePath = process.env.CI
      ? example.path
      : path.join(example.path, '.dumi/tmp_prepare' /** ignored */);

    const pkgFile = path.join(rewritePath, 'package.json');

    fsExtra.ensureFileSync(pkgFile);
    fsExtra.writeJSONSync(pkgFile, newPkgJson, { spaces: 2 });

    console.log(
      `[${example.name}] Successfully prepared package.json => ${path.relative(
        rootPath,
        pkgFile,
      )}`,
    );
  }
}

// \\\\\\\\\\\
//  \\\ main \\
//   \\\\\\\\\\\
main();
