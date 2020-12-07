import fs from 'fs';
import path from 'path';
import { IApi } from '@umijs/types';
import { rimraf } from '@umijs/utils';
import { Service } from '@umijs/core';
import { render } from '@testing-library/react';
import symlink from './utils/symlink';

describe('preset-dumi', () => {
  const fixtures = path.join(__dirname, 'fixtures');

  afterAll(() => {
    // clear all node_modules
    ['', 'basic', 'algolia', 'demos', 'assets', 'local-theme', 'integrate'].forEach(dir => {
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

    // wait for debounce
    await new Promise(resolve => setTimeout(resolve));

    // expect demos generate
    const demos = require(path.join(service.paths.absTmpPath, 'dumi', 'demos')).default;

    expect(Object.keys(demos).length).toEqual(3);
    expect(demos['tsx-demo']).not.toBeUndefined();
    expect(demos['component-demo'].previewerProps.componentName).toEqual('ForceComponent');
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

  it('platform env', async () => {
    const oType = process.env.PLATFORM_TYPE;

    process.env.PLATFORM_TYPE = 'TESTING';

    const service = new Service({
      cwd: fixtures,
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });
    const defines = (await service.run({
      name: 'webpack',
      args: {
        _: ['webpack'],
        plugin: 'define',
      },
    })) as any;

    // expect define PLATFORM_TYPE
    expect(defines.definitions['process.env.PLATFORM_TYPE'] === process.env.PLATFORM_TYPE);

    // restore env
    process.env.PLATFORM_TYPE = oType;
  });

  it('integrate mode', async () => {
    const cwd = path.join(fixtures, 'integrate');
    const service = new Service({
      cwd,
      env: 'development',
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    // alias dumi-theme-default
    symlink(
      path.join(__dirname, '../../theme-default'),
      path.join(service.paths.absNodeModulesPath, 'dumi-theme-default'),
    );

    // remove @umijs/preset-dumi from package.json to use the source code from ./index.ts
    service.initialPresets = service.initialPresets.filter(({ id }) => id !== '@umijs/preset-dumi');
    await service.init();

    const api = service.getPluginAPI({
      service,
      key: 'test',
      id: 'test',
    });

    // expect all docs inside /~docs route path and keep original umi routes
    const routes = await (api as any).getRoutes();

    expect(routes.map(route => route.path)).toEqual([
      '/~demos/:uuid',
      '/_demos/:uuid',
      '/~docs',
      '/A',
      '/',
    ]);

    // expect docs component path resolve correctly in configuring routing mode
    const rootRoute = await (api as any).applyPlugins({
      key: 'dumi.getRootRoute',
      type: (api as any).ApplyPluginsType.modify,
      initialValue: routes,
    });

    // all component path will be resolved to absolute path in configuring routing mode
    // ref: https://github.com/umijs/umi/blob/ef674b120c9a3188f0167a9fa2211d3cdbf60a21/packages/core/src/Route/Route.ts#L114
    expect(path.isAbsolute(rootRoute.routes[0].component)).toBeTruthy();

    // expect path correct
    expect(fs.existsSync(rootRoute.routes[0].component)).toBeTruthy();
  });

  it('integrate mode with production', async () => {
    const cwd = path.join(fixtures, 'integrate');
    const service = new Service({
      cwd,
      env: 'production',
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    // remove @umijs/preset-dumi from package.json to use the source code from ./index.ts
    service.initialPresets = service.initialPresets.filter(({ id }) => id !== '@umijs/preset-dumi');
    await service.init();

    const api = service.getPluginAPI({
      service,
      key: 'test',
      id: 'test',
    });

    // expect dumi disabled in integrate with production
    expect((await (api as any).getRoutes()).map(route => route.path)).toEqual(['/A', '/']);
  });

  it('should generate sitemap.xml', async () => {
    const cwd = path.join(fixtures, 'sitemap');
    const service = new Service({
      cwd,
      env: 'production',
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('./index.ts')],
    });

    await service.init();

    const api = service.getPluginAPI({
      service,
      key: 'test',
      id: 'test',
    }) as IApi;

    if (!fs.existsSync(api.paths.absOutputPath)) {
      fs.mkdirSync(api.paths.absOutputPath);
    }

    await api.applyPlugins({
      key: 'onBuildComplete',
      type: api.ApplyPluginsType.event,
    });

    // expect sitemap.xml content correctly
    expect(fs.readFileSync(path.join(api.paths.absOutputPath, 'sitemap.xml')).toString()).toEqual(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://d.umijs.org/</loc></url><url><loc>https://d.umijs.org/test</loc></url></urlset>',
    );
  });
});
