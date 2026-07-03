import * as logger from '@umijs/utils/dist/logger';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import 'zx/globals';

const all = [
  '.',
  'assets-types',
  ...readdirSync(join(__dirname, '../suites')).map(
    (suite) => `suites/${suite}`,
  ),
];

function getNpmTag(version: string) {
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    return 'next';
  }
  if (version.includes('-canary.')) return 'canary';
  return 'latest';
}

async function isPublished(name: string, version: string) {
  try {
    const publishedVersion = (
      await $`npm view ${`${name}@${version}`} version --registry https://registry.npmjs.org/`
    ).stdout.trim();
    return publishedVersion === version;
  } catch {
    return false;
  }
}

async function getChangedPackageDirs() {
  if (argv.all || process.argv.includes('--all')) {
    return all;
  }

  let changedFiles: string[] = [];
  try {
    changedFiles = (
      await $`git diff --name-only HEAD^ HEAD -- package.json assets-types/package.json suites/*/package.json`
    ).stdout
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    logger.info('failed to detect changed packages, fallback to all packages');
    return all;
  }

  return all.filter((pkg) => {
    const pkgJsonPath = pkg === '.' ? 'package.json' : `${pkg}/package.json`;
    return changedFiles.includes(pkgJsonPath);
  });
}

async function publishPackage(opts: {
  name: string;
  dir: string;
  version: string;
  tag: string;
  dryRun: boolean;
}) {
  if (await isPublished(opts.name, opts.version)) {
    logger.info(`skip ${opts.name}@${opts.version}, already published`);
    return;
  }

  const packDir = mkdtempSync(join(tmpdir(), 'dumi-release-'));
  const publishDir = mkdtempSync(join(tmpdir(), 'dumi-release-publish-'));
  try {
    await $`cd ${opts.dir} && npm_config_ignore_scripts=true pnpm pack --pack-destination ${packDir}`;
    const tarballs = readdirSync(packDir).filter((file) =>
      file.endsWith('.tgz'),
    );
    if (tarballs.length !== 1) {
      throw new Error(`Expected one tarball for ${opts.name}, got ${tarballs}`);
    }

    const tarball = join(packDir, tarballs[0]);
    await $`tar -xzf ${tarball} --strip-components=1 -C ${publishDir}`;
    if (opts.dryRun) {
      logger.info(
        `[dry-run] cd ${publishDir} && npm publish --tag ${opts.tag}`,
      );
      return;
    }

    await $`cd ${publishDir} && npm publish --tag ${opts.tag} --access public --provenance`;
    logger.info(`+ ${opts.name}`);
  } finally {
    rmSync(packDir, { recursive: true, force: true });
    rmSync(publishDir, { recursive: true, force: true });
  }
}

(async () => {
  const version = require('../package.json').version;
  const tag = getNpmTag(version);
  const dryRun =
    argv['dry-run'] || argv.dryRun || process.argv.includes('--dry-run');
  const changedPkgDirs = await getChangedPackageDirs();
  const publishInfos = changedPkgDirs
    .map((pkg) => {
      const pkgJsonPath = join(process.cwd(), pkg, 'package.json');
      if (!existsSync(pkgJsonPath)) return null;

      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
      if (!pkgJson.name || pkgJson.private) return null;

      return {
        name: pkgJson.name,
        dir: dirname(pkgJsonPath),
        version: pkgJson.version,
      };
    })
    .filter(Boolean) as { name: string; dir: string; version: string }[];

  logger.event(`publish packages with npm tag ${tag}`);
  for (const publishInfo of publishInfos) {
    await publishPackage({
      ...publishInfo,
      tag,
      dryRun,
    });
  }
})();
