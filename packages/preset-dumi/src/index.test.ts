import fs from 'fs';
import path from 'path';
import { rimraf } from '@umijs/utils';
import { Service } from '@umijs/core';
import { render } from '@testing-library/react';
import symlink from './utils/symlink';

describe('preset-dumi', () => {
  const fixtures = path.join(__dirname, 'fixtures');

  afterAll(() => {
    // clear all node_modules
    ['', 'basic', 'algolia', 'demos', 'assets', 'local-theme'].forEach(dir => {
      rimraf.sync(path.join(fixtures, dir, 'node_modules'));
    });
  });

  it('init', async () => {
    const service = new Service({
      cwd: fixtures,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    await expect(service.init()).resolves.not.toThrowError();
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
  });

  it('assets command', async () => {
    const cwd = path.join(fixtures, 'assets');
    const service = new Service({
      cwd,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    await service.run({
      name: 'assets',
      args: {
        _: ['assets'],
      },
    });

    // expect assets.json generate
    const { assets } = require(path.join(service.paths.cwd, 'assets.json'));
    const { assets: expectAssets } = require(path.join(service.paths.cwd, 'assets.expect.json'));

    expect(assets.atoms[0]).toEqual(expectAssets.atoms[0]);
    expect(assets.examples[0]).toEqual(expectAssets.examples[0]);
    expect(assets.examples[1].name).toEqual('react');
    expect(assets.examples[1].dependencies.react).not.toBeUndefined();
  });

  it('local theme', async () => {
    const cwd = path.join(fixtures, 'local-theme');
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
    const { findByText } = render(reactNode);

    expect(await findByText('local theme layout')).not.toBeNull();
  });
});
