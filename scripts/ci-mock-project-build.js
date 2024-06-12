const path = require('path');
const os = require('os');
const assert = require('assert');
const { execa, prompts, yParser, fsExtra } = require('@umijs/utils');

// ====== util ======
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  files = fsExtra.readdirSync(dirPath);

  // eslint-disable-next-line no-param-reassign
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fsExtra.statSync(path.join(dirPath, file)).isDirectory()) {
      // eslint-disable-next-line no-param-reassign
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
};

const getTotalSize = (directoryPath) =>
  getAllFiles(directoryPath).reduce(
    (acc, file) => acc + fsExtra.statSync(file).size,
    0,
  );

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const createDumi = require.resolve(
  path.join(__dirname, '../suites/boilerplate/dist/index.js'),
);

const dumiCli = require.resolve(path.join(__dirname, '../bin/dumi.js'));

function main() {
  /**
   * --type=site --client=npm
   * type: site, react, theme
   * client: npm, cnpm, tnpm, yarn, pnpm
   */
  const args = yParser(process.argv.slice(2));
  const finalType = args.type || 'react';
  const finalClient = args.client || 'pnpm';

  const projectName = `dumi-${finalType}`;
  const tmpDir = path.join(
    os.tmpdir(),
    'create-dumi',
    `mock-${projectName}`,
    finalClient,
  );
  fsExtra.emptyDirSync(tmpDir);

  // \\\\\\\\\\ [start] \\\\\\\\\\
  /**
   * 终端交互问题： /suites/boilerplate/src/index.ts
   * 如果 createDumi 有终端交互，需要提前准备好 answers
   */
  const questionsAnswers = [
    undefined, // description [optional]
    'dumi/script', // author
  ];

  if (finalType === 'theme') {
    questionsAnswers.unshift(projectName); // name
    questionsAnswers.push(true); // hasPlugin
  } else if (finalType === 'react') {
    questionsAnswers.unshift(projectName); // name
  } else {
    questionsAnswers.unshift(projectName); // name
  }
  // \\\\\\\\\\ [end] \\\\\\\\\\

  execa.execaSync('git', ['init'], {
    cwd: tmpDir,
    stdio: 'inherit',
  });
  execa.execaSync('git', ['config', '--local', 'core.hooksPath', '.husky'], {
    cwd: tmpDir,
    stdio: 'inherit',
  });

  // Inject answers to the prompts
  prompts.inject([finalType, finalClient, ...questionsAnswers]);

  // Run createDumi
  require(createDumi)
    .default({ cwd: tmpDir, args })
    .then(() => {
      // Run build
      execa.execaSync('node', [dumiCli, 'build'], {
        cwd: tmpDir,
        stdio: 'inherit',
      });

      // Expect the build output (dist) exists and not empty (10 kb at least)
      let output = 'dist';
      if (finalType === 'theme') output = 'dist';
      else if (finalType === 'react') output = 'docs-dist';
      else if (finalType === 'site') output = 'dist';

      const distDir = path.join(tmpDir, output);
      assert(
        fsExtra.existsSync(distDir),
        `expect dist directory ${distDir} exists`,
      );
      console.log(`✅ [${finalType}] build successfully`);

      const distDirSize = getTotalSize(distDir);
      assert(
        distDirSize > 10 * 1024,
        `expect dist directory ${distDir} not empty`,
      );
      console.log(`📦 [${finalType}] dist size: ${distDirSize} bytes`);
    });
}

// \\\\\\\\\\
main();
// \\\\\\\\\\
