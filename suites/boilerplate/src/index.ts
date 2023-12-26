import {
  BaseGenerator,
  execa,
  fsExtra,
  installWithNpmClient as installDeps,
  prompts,
  yParser,
} from '@umijs/utils';
import { join } from 'path';

async function getPnpmVersion() {
  try {
    return (await execa.execa('pnpm', ['--version'])).stdout;
  } catch (e) {
    throw new Error('Please install pnpm first');
  }
}

async function installWithNpmClient({
  npmClient,
  cwd,
}: Parameters<typeof installDeps>[0]) {
  if (npmClient === 'pnpm' && /^8\.[0-6]\./.test(await getPnpmVersion())) {
    // to avoid pnpm 8.0 ~ 8.6 install minimal version of deps
    await execa.execa('pnpm', ['up', '-L'], { cwd, stdio: 'inherit' });
  } else {
    installDeps({ npmClient, cwd });
  }
}

export default async ({
  cwd,
  args,
}: {
  cwd: string;
  args: yParser.Arguments;
}) => {
  const [name] = args._;
  const target = name ? join(cwd, name) : cwd;
  const registry = 'https://registry.npmjs.org/';
  const { type, npmClient } = await prompts(
    [
      {
        type: 'select',
        name: 'type',
        message: 'Pick template type',
        choices: [
          { title: 'Static Site', value: 'site' },
          { title: 'React Library', value: 'react' },
          { title: 'Theme Package', value: 'theme' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'npmClient',
        message: 'Pick NPM client',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'cnpm', value: 'cnpm' },
          { title: 'tnpm', value: 'tnpm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' },
        ],
        initial: 0,
      },
    ],
    {
      onCancel() {
        process.exit(1);
      },
    },
  );
  let hasPlugin = false;
  const descriptions = {
    site: 'A static site based on dumi',
    react: 'A react library developed with dumi',
    theme: 'A theme package for dumi',
  };
  const questions: prompts.PromptObject[] = [
    {
      name: 'description',
      type: 'text',
      message: `Input project description`,
      initial: descriptions[type],
    },
    {
      name: 'author',
      type: 'text',
      message: `Input project author (Name <email@example.com>)`,
    },
  ];

  if (type === 'theme') {
    questions.unshift({
      name: 'name',
      type: 'text',
      message: `Input NPM package name (dumi-theme-xxx or @org/dumi-theme-xxx)`,
      validate: (value: string) => {
        if (/^dumi-theme-.+|\/dumi-theme-.+/.test(value)) return true;
        return 'Invalid NPM package name, should be dumi-theme-xxx or @org/dumi-theme-xxx';
      },
    });
    questions.push({
      name: 'hasPlugin',
      type: 'confirm',
      message: `Does this theme need to register an additional dumi plugin?`,
      onState: ({ value }) => {
        hasPlugin = value;
      },
    });
  } else if (type === 'site') {
    questions.unshift({
      name: 'name',
      type: 'text',
      message: `Input project name`,
    });
  } else if (type === 'react') {
    questions.unshift({
      name: 'name',
      type: 'text',
      message: 'Input NPM package name',
      validate: (value: string) => {
        if (value && value.trim()) return true;
        return 'NPM package name is required';
      },
    });
  }

  const generator = new BaseGenerator({
    path: join(__dirname, `../templates/${type}`),
    target,
    data: {
      version: process.env.DUMI_VERSION,
      npmClient,
      registry,
    },
    questions,
  });
  await generator.run();
  // remove plugin dir if not need
  if (!hasPlugin) {
    fsExtra.removeSync(join(target, './src/plugin'));
  }
  // install
  await installWithNpmClient({ npmClient, cwd: target });
};
