import {
  BaseGenerator,
  fsExtra,
  installWithNpmClient,
  prompts,
  yParser,
} from '@umijs/utils';
import { join } from 'path';

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
  const { npmClient } = await prompts(
    [
      {
        type: 'select',
        name: 'type',
        message: 'Pick template type',
        choices: [{ title: 'Theme Package', value: 'theme' }],
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
        initial: 4,
      },
    ],
    {
      onCancel() {
        process.exit(1);
      },
    },
  );
  let hasPlugin = false;
  const generator = new BaseGenerator({
    path: join(__dirname, '../templates/theme'),
    target,
    data: {
      version: '^2.0.0-beta.10',
      npmClient,
      registry,
    },
    questions: [
      {
        name: 'name',
        type: 'text',
        message: `Input NPM package name (dumi-theme-xxx or @org/dumi-theme-xxx)`,
        validate: (value: string) => {
          if (/^dumi-theme-.+|\/dumi-theme-.+/.test(value)) return true;
          return 'Invalid NPM package name, should be dumi-theme-xxx or @org/dumi-theme-xxx';
        },
      },
      {
        name: 'description',
        type: 'text',
        message: `Input NPM package description`,
      },
      {
        name: 'author',
        type: 'text',
        message: `Input NPM package author (Name <email@example.com>)`,
      },
      {
        name: 'hasPlugin',
        type: 'confirm',
        message: `Does this theme need to register an additional dumi plugin?`,
        onState: ({ value }) => {
          hasPlugin = value;
        },
      },
    ],
  });
  await generator.run();
  // remove plugin dir if not need
  if (!hasPlugin) {
    fsExtra.removeSync(join(target, './src/plugin'));
  }
  // install
  installWithNpmClient({ npmClient, cwd: target });
};
