import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';

const examples = fg.sync(['examples/**/package.json'], {
  cwd: process.cwd(),
  onlyFiles: true,
  ignore: ['**/node_modules/**', '.git'],
});

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
  for (const example of examples) {
    const pkgJson = require(example);
    const newPkgJson = modifyPackageJson(pkgJson);

    const rewritePath = process.env.CI
      ? example
      : path.join(
          path.dirname(example),
          '.dumi/tmp', // ignore .dumi/tmp
          path.basename(example, '.json') + '_rewrite.json',
        );

    if (!fs.existsSync(path.dirname(rewritePath))) {
      fs.mkdirSync(path.dirname(rewritePath), { recursive: true });
    }

    fs.writeFileSync(rewritePath, JSON.stringify(newPkgJson, null, 2));
  }
}

// \\\\\\\\\\\
//  \\\ main \\
//   \\\\\\\\\\\
main();
