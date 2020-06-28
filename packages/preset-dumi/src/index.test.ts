import fs from 'fs';
import path from 'path';
import { Service } from '@umijs/core';
import { render } from '@testing-library/react';

describe('preset-dumi', () => {
  const fixtures = path.join(__dirname, 'fixtures');

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

    // FIXME: find the real reason why component path missing 1 level in routes.ts
    service.paths.absPagesPath += '/tmp';

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
});
