import { join } from 'path';
import { Service } from '@umijs/core';
import fs from 'fs';

const fixtures = join(__dirname, 'fixtures');

test('init', async () => {
  const service = new Service({
    cwd: fixtures,
    presets: [require.resolve('@umijs/preset-built-in'), require.resolve('@umijs/preset-dumi')],
  });

  await expect(service.init()).resolves.not.toThrowError();
});

test('normal', async () => {
  const cwd = join(fixtures, 'normal');
  const service = new Service({
    cwd,
    presets: [
      require.resolve('@umijs/preset-built-in'),
      require.resolve('@umijs/preset-dumi'),
      require.resolve('./fixtures/index'),
    ],
  });

  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });

  const apis = JSON.parse(fs.readFileSync(join(cwd, '.umi-test', 'dumi', 'apis.json')).toString());
  expect(apis).toEqual({
    Helloooo: {
      default: [
        {
          identifier: 'className',
          type: 'string',
        },
        {
          identifier: 'name',
          type: 'string',
          required: true,
        },
      ],
    },
  });
});

test('custom', async () => {
  const cwd = join(fixtures, 'custom');
  const service = new Service({
    cwd,
    presets: [
      require.resolve('@umijs/preset-built-in'),
      require.resolve('@umijs/preset-dumi'),
      require.resolve('./fixtures/index'),
    ],
  });

  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });

  const apis = JSON.parse(fs.readFileSync(join(cwd, '.umi-test', 'dumi', 'apis.json')).toString());
  expect(apis).toEqual({
    Hello: {
      default: [
        {
          identifier: 'className',
          type: 'string',
        },
        {
          identifier: 'name',
          type: 'string',
          required: true,
        },
      ],
    },
  });
});
