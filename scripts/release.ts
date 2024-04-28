import rimraf from '@umijs/utils/compiled/rimraf';
import * as logger from '@umijs/utils/dist/logger';
import assert from 'assert';
import fs from 'fs';
import getGitRepoInfo from 'git-repo-info';
import { join } from 'path';
import 'zx/globals';

const all = [
  '.',
  'assets-types',
  ...fs
    .readdirSync(join(__dirname, '../suites'))
    .map((suite) => `suites/${suite}`),
];

(async () => {
  const { branch } = getGitRepoInfo();
  logger.info(`branch: ${branch}`);
  logger.info(`pkgs: ${all.join(', ')}`);

  // check git status
  logger.event('check git status');
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // check git remote update
  logger.event('check git remote update');
  await $`git fetch`;
  const gitStatus = (await $`git status --short --branch`).stdout.trim();
  assert(!gitStatus.includes('behind'), `git status is behind remote`);

  // check npm registry
  logger.event('check npm registry');
  const registry = (await $`npm config get registry`).stdout.trim();
  assert(
    registry === 'https://registry.npmjs.org/',
    'npm registry is not https://registry.npmjs.org/',
  );

  // check npm ownership
  logger.event('check npm ownership');
  const whoami = (await $`npm whoami`).stdout.trim();
  await Promise.all(
    ['dumi', 'create-dumi'].map(async (pkg) => {
      const owners = (await $`npm owner ls ${pkg}`).stdout
        .trim()
        .split('\n')
        .map((line) => {
          return line.split(' ')[0];
        });
      assert(owners.includes(whoami), `${pkg} is not owned by ${whoami}`);
    }),
  );

  // select pkgs
  const pkgs: string[] = [];
  const vers: Record<string, string> = {};

  for (const pkg of all) {
    const isMain = pkg === '.';
    const pkgJson = require(join('..', pkg, 'package.json'));
    const ver = await question(
      `Input ${
        isMain ? '`dumi`' : `\`${pkgJson.name}\``
      } release version\n(current: ${pkgJson.version}${
        isMain ? '' : ', empty means skip, . means same with `dumi`'
      }): `,
    );

    if (ver) {
      pkgs.push(pkg);
      vers[pkg] = ver === '.' ? vers['.'] : ver;
    } else {
      assert(!isMain, 'main package version can not be empty');
    }
  }

  // clean
  logger.event('clean');
  pkgs.forEach((pkg) => {
    logger.info(`clean ${pkg}/dist`);
    rimraf.sync(join(pkg, 'dist'));
  });

  // build packages
  logger.event('build packages');
  for (const pkg of pkgs) {
    if (require(join('..', pkg, 'package.json')).scripts?.build) {
      await $`cd ${pkg} && npm run build`;
    }
  }

  // bump version
  logger.event('bump version');
  const version = vers['.'];
  await Promise.all(
    pkgs.map(async (pkg) => {
      await $`cd ${pkg} && npm version ${vers[pkg]} --no-git-tag-version`;
    }),
  );
  let tag = 'latest';
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  }
  if (version.includes('-canary.')) tag = 'canary';

  // commit
  logger.event('commit');
  await $`git commit --all --message "build: release ${version}"`;

  // git tag
  if (tag !== 'canary') {
    logger.event('git tag');
    await $`git tag v${version}`;
  }

  // git push
  logger.event('git push');
  await $`git push origin ${branch} --tags`;

  // npm publish
  logger.event('pnpm publish');
  $.verbose = false;

  // check 2fa config
  let otpArg: string[] = [];
  if (
    (await $`npm profile get "two-factor auth"`).toString().includes('writes')
  ) {
    let code = '';
    do {
      // get otp from user
      code = await question('This operation requires a one-time password: ');
      // generate arg for zx command
      // why use array? https://github.com/google/zx/blob/main/docs/quotes.md
      otpArg = ['--otp', code];
    } while (code.length !== 6);
  }

  await Promise.all(
    pkgs.map(async (pkg) => {
      await $`cd ${pkg} && pnpm publish --no-git-checks --tag ${tag} ${otpArg}`;
      logger.info(`+ ${pkg}@${vers[pkg]}`);
    }),
  );

  // sync tnpm
  logger.event('sync tnpm');
  $.verbose = false;
  await Promise.all(
    pkgs.map(async (pkg) => {
      const { name } = require(path.join(pkg, 'package.json'));
      logger.info(`sync ${name}`);
      await $`tnpm sync ${name}`;
    }),
  );
  $.verbose = true;
})();
