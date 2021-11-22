import { join } from 'path';
import { Service } from '@umijs/core';
import fs from 'fs';

const fixtures = join(__dirname, 'fixtures');

describe('@umijs/plugin-dumi-api', () => {
  test('init', async () => {
    const service = new Service({
      cwd: fixtures,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('@umijs/preset-dumi')],
    });

    await expect(service.init()).resolves.not.toThrowError();
  });

  test('normal parse apis.json', async () => {
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

    const apis = JSON.parse(
      fs.readFileSync(join(cwd, '.umi-test', 'dumi', 'apis.json')).toString(),
    );
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

  test('Should support to customize src', async () => {
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

    const apis = JSON.parse(
      fs.readFileSync(join(cwd, '.umi-test', 'dumi', 'apis.json')).toString(),
    );
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

  test('Should support to alias src', async () => {
    const cwd = join(fixtures, 'alias');
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

    const apis = JSON.parse(
      fs.readFileSync(join(cwd, '.umi-test', 'dumi', 'apis.json')).toString(),
    );
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
      Peach: {
        default: [
          {
            identifier: 'className',
            type: 'string',
            required: true,
          },
          {
            identifier: 'age',
            type: 'number',
            required: true,
          },
        ],
        Apple: [
          {
            identifier: 'className',
            type: 'string',
          },
          {
            identifier: 'type',
            type: '"Peach" | "apple"',
            required: true,
          },
        ],
      },
    });
  });
});
