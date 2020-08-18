import fs from 'fs';
import path from 'path';
import { rimraf } from '@umijs/utils';
import { Service } from '@umijs/core';
import { render } from '@testing-library/react';
import symlink from './utils/symlink';

describe('preset-dumi', () => {
  const fixtures = path.join(__dirname, 'fixtures');

  it('init', async () => {
    const service = new Service({
      cwd: fixtures,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    await expect(service.init()).resolves.not.toThrowError();

    rimraf.sync(path.join(fixtures, 'node_modules'));
  });

  it('core', async () => {
    const cwd = path.join(fixtures, 'basic');
    const service = new Service({
      cwd,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    // alias dumi-theme-default
    symlink(
      path.join(__dirname, '../../theme-default'),
      path.join(service.paths.absNodeModulesPath, 'dumi-theme-default'),
    );

    await service.run({
      name: 'g',
      args: {
        _: ['g', 'tmp'],
      },
    });

    const reactNode = require(path.join(cwd, '.umi-test', 'umi.ts')).default;
    const { container } = render(reactNode);

    expect(container.textContent).toContain('dumi');

    rimraf.sync(path.join(fixtures, 'basic', 'node_modules'));
  });

  it('algolia', async () => {
    const cwd = path.join(fixtures, 'algolia');
    const service = new Service({
      cwd,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    await service.run({
      name: 'g',
      args: {
        _: ['g', 'html'],
      },
    });

    expect(fs.readFileSync(path.join(cwd, 'dist', 'index.html'), 'utf-8')).toContain(
      'docsearch.js',
    );

    rimraf.sync(path.join(fixtures, 'algolia', 'node_modules'));
  });

  it('demos', async () => {
    const cwd = path.join(fixtures, 'demos');
    const service = new Service({
      cwd,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    await service.run({
      name: 'g',
      args: {
        _: ['g', 'tmp'],
      },
    });

    // expect demos generate
    const demos = require(path.join(service.paths.absTmpPath, 'dumi', 'demos')).default;

    expect(Object.keys(demos).length).toEqual(2);
    expect(demos['tsx-demo']).not.toBeUndefined();

    rimraf.sync(path.join(fixtures, 'demos', 'node_modules'));
  });
});
