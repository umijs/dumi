import { IApi } from '@umijs/types';
import fetch from 'node-fetch';
import url from 'url';
import { join } from 'path';
import { existsSync } from 'fs';
import hostedGit from 'hosted-git-info';
import { outputJson } from 'fs-extra';

const DIR_NAME = '.dumi';
const FILE_NAME = 'github-commits';
const RELATIVE_FILE = join(DIR_NAME, FILE_NAME);
const RELATIVE_FILE_PATH = `${RELATIVE_FILE}.json`;

async function getAllGHCommits(repos, page = 1) {
  try {
    const request = await fetch(url.format({
      protocol: 'https',
      hostname: 'api.github.com',
      pathname: `repos${repos}/commits`,
      query: {
        access_token: process.env.GITHUB_TOKEN,
        per_page: 100,
        page
      }
    }));
    let commits = await request.json().then(list => list.reduce((obj, commit) => {
      obj[commit.sha] = {
        id: commit.author.login,
        avatar: commit.author.avatar_url,
        time: commit.commit.committer.date
      };
      return obj;
    }, {}));

    // recursively get more commits if there are more to get, limit 2k
    if (Object.keys(commits).length === 100 && page < 20) {
      commits = { ...commits, ...await getAllGHCommits(repos, page + 1) };
    }

    return commits;
  } catch {
    return {};
  }
}

export default (api: IApi) => {
  const repoUrl = hostedGit.fromUrl(api.pkg.repository?.url || api.pkg.repository)?.browse();
  const regex = /github\.com/;
  if (!regex.test(repoUrl)) {
    return;
  }

  const github = repoUrl.match(/github\.com(\S*)/)[1];
  if (!existsSync(join(api.paths.absNodeModulesPath, RELATIVE_FILE_PATH))) {
    outputJson(join(api.paths.absNodeModulesPath, RELATIVE_FILE_PATH), {}, { spaces: 2 });
  }

  api.registerCommand({
    name: 'github',
    fn: async () => {
      const History = await getAllGHCommits(github);
      outputJson(join(api.paths.absNodeModulesPath, RELATIVE_FILE_PATH), History, { spaces: 2 });
    },
  });
};
