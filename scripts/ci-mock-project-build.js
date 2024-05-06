const path = require('path');

const { execa, prompts, yParser, fsExtra } = require('@umijs/utils');

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
    process.cwd(),
    `.tmp/mock-${projectName}/${finalClient}`,
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
    });
}

main();
