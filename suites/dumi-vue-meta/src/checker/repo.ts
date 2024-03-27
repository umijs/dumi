import { spawnSync } from 'node:child_process';
import type { PosixPath } from 'typesafe-path/posix';
import { MetaCheckerOptions } from '../types';
import { getPosixPath } from '../utils';

function git(...args: string[]) {
  return spawnSync('git', args, {
    windowsHide: true,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
}

// Should have three capturing groups:
// 1. hostname
// 2. user
// 3. project
const repoExpressions = [
  /(github(?!.us)(?:\.[a-z]+)*\.[a-z]{2,})[:/]([^/]+)\/(.*)/,
  /(\w+\.githubprivate.com)[:/]([^/]+)\/(.*)/, // GitHub enterprise
  /(\w+\.ghe.com)[:/]([^/]+)\/(.*)/, // GitHub enterprise
  /(\w+\.github.us)[:/]([^/]+)\/(.*)/, // GitHub enterprise
  /(bitbucket.org)[:/]([^/]+)\/(.*)/,
  /(gitlab.com)[:/]([^/]+)\/(.*)/,
  /(gitee.com)[:/]([^/]+)\/(.*)/, // gitee
];

function parseRepoLinks(remotes: string[]) {
  for (const repoLink of remotes) {
    for (const regex of repoExpressions) {
      const match = regex.exec(repoLink);
      if (match) {
        return {
          hostname: match[1],
          user: match[2],
          project: match[3],
        };
      }
    }
  }
  return null;
}

export function guessSourceUrlTemplate(remotes: string[]): string | undefined {
  let { hostname, user = '', project } = parseRepoLinks(remotes) || {};

  if (!hostname) return;

  if (project && project.endsWith('.git')) {
    project = project.slice(0, -4);
  }

  let sourcePath = 'blob';
  let anchorPrefix = 'L';
  if (hostname.includes('gitlab')) {
    sourcePath = '-/blob';
  } else if (hostname.includes('bitbucket')) {
    sourcePath = 'src';
    anchorPrefix = 'lines-';
  }

  return `https://${hostname}/${user}/${project}/${sourcePath}/{gitRevision}/{path}#${anchorPrefix}{line}`;
}

let haveGit: boolean;
export function gitIsInstalled() {
  haveGit ??= git('--version').status === 0;
  return haveGit;
}

type RepoInfo = {
  urlTemplate: string;
  repoPath: PosixPath;
  gitRevision?: string;
};

function getGitRepoInfo(
  rootPath: string,
  checkerOptions: MetaCheckerOptions,
): RepoInfo | null {
  const { gitRemote = 'origin', sourceLinkTemplate } = checkerOptions;
  const topLevel = git('-C', rootPath, 'rev-parse', '--show-toplevel');
  if (topLevel.status !== 0) return null;
  const repoPath = getPosixPath(topLevel.stdout.replace('\n', ''));
  const gitRevision =
    checkerOptions.gitRevision ||
    git('-C', rootPath, 'rev-parse', '--short', 'HEAD').stdout.trim();

  if (!gitRevision) {
    console.warn(`cannot get git revision. Source links will be broken.`);
    return null;
  }
  let urlTemplate = sourceLinkTemplate;
  if (!urlTemplate) {
    const remotesOut = git('-C', rootPath, 'remote', 'get-url', gitRemote);
    if (remotesOut.status === 0) {
      urlTemplate = guessSourceUrlTemplate(remotesOut.stdout.split('\n'));
      if (!urlTemplate) {
        console.warn(
          'current Git Repo URL cannot be parsed. Please set `sourceLinkTemplate`.',
        );
      }
    } else {
      console.warn(
        `The provided git remote "${gitRemote}" was not valid. Source links will be broken.`,
      );
    }
  }
  if (!urlTemplate) return null;
  return {
    urlTemplate,
    repoPath,
    gitRevision,
  };
}

export function createRepo(
  rootPath: string,
  fileNames: Set<PosixPath>,
  checkerOptions: MetaCheckerOptions,
) {
  const {
    disableSources = false,
    disableGit = false,
    sourceLinkTemplate,
  } = checkerOptions;
  if (disableSources) return null;
  let info: RepoInfo | null = null;
  if (disableGit) {
    if (!sourceLinkTemplate) {
      throw new Error(
        'disabled git, but did not set `sourceLinkTemplate`.' +
          'Please set `sourceLinkTemplate` to produce source links or just set `disableSources`.',
      );
    }
    if (
      !checkerOptions.gitRevision &&
      sourceLinkTemplate.includes('{gitRevision}')
    ) {
      throw new Error(
        'after disable git, you must set `gitRevision` or include gitRevision(not {gitRevision}) in sourceLinkTemplate',
      );
    }
    info = {
      urlTemplate: sourceLinkTemplate,
      repoPath: getPosixPath(rootPath),
      gitRevision: checkerOptions.gitRevision,
    };
  } else {
    if (!gitIsInstalled()) {
      return null;
    }
    info = getGitRepoInfo(rootPath, checkerOptions);
    if (!info?.gitRevision) return null;
  }
  const { repoPath, gitRevision, urlTemplate } = info;
  return {
    getURL: (fileName: string, line: number) => {
      const posixFileName = getPosixPath(fileName);
      if (
        !fileNames.has(posixFileName) ||
        /node_modules\//.test(posixFileName) // Don't rely solely on exclude
      ) {
        return '';
      }
      const replacements = {
        gitRevision,
        path: fileName.substring(repoPath.length + 1),
        line,
      };
      return urlTemplate!.replace(
        /\{(gitRevision|path|line)\}/g,
        (_, key) => replacements[key as never],
      );
    },
  };
}

export type Repo = ReturnType<typeof createRepo>;
