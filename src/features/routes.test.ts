import fs from 'fs';
import os from 'os';
import path from 'path';
import { glob, winPath } from 'umi/plugin-utils';
import { vi } from 'vitest';
import routesFeature from './routes';

function getTmpGenerateWatchers(
  cwd = path.join(path.sep, 'tmp', 'dumi-routes-app'),
) {
  const addTmpGenerateWatcherPaths = vi.fn();
  const api: any = new Proxy(
    {
      addTmpGenerateWatcherPaths,
      config: {
        resolve: {
          atomDirs: [{ type: 'component', dir: 'components' }],
          docDirs: ['docs', { type: 'guide', dir: 'guides' }],
        },
        utoopack: true,
      },
      cwd,
      env: 'development',
    },
    {
      get(target, property) {
        if (property in target) return target[property as keyof typeof target];

        return vi.fn();
      },
    },
  );

  routesFeature(api);

  return {
    cwd,
    watchers: addTmpGenerateWatcherPaths.mock.calls[0][0](),
  };
}

test('tmp generation watches route topology changes only', () => {
  const { cwd, watchers } = getTmpGenerateWatchers();

  expect(watchers).toEqual([
    {
      path: winPath(
        path.join(
          cwd,
          'components',
          '{*,*/index,*/index.*,*/README,*/README.*}.md',
        ),
      ),
      events: ['add', 'unlink'],
    },
    {
      path: winPath(path.join(cwd, 'docs', '**/*.md')),
      events: ['add', 'unlink'],
    },
    {
      path: winPath(path.join(cwd, 'guides', '**/*.md')),
      events: ['add', 'unlink'],
    },
  ]);
});

test('tmp generation watcher globs use portable path separators', () => {
  const { watchers } = getTmpGenerateWatchers(
    String.raw`C:\workspace\dumi-app`,
  );

  expect(watchers.map(({ path: watcherPath }: any) => watcherPath)).toEqual([
    'C:/workspace/dumi-app/components/{*,*/index,*/index.*,*/README,*/README.*}.md',
    'C:/workspace/dumi-app/docs/**/*.md',
    'C:/workspace/dumi-app/guides/**/*.md',
  ]);
});

test('non-utoopack bundlers keep the existing string watchers', () => {
  const addTmpGenerateWatcherPaths = vi.fn();
  const cwd = path.join(path.sep, 'tmp', 'dumi-routes-app');
  const api: any = new Proxy(
    {
      addTmpGenerateWatcherPaths,
      config: {
        resolve: {
          atomDirs: [{ type: 'component', dir: 'components' }],
          docDirs: ['docs'],
        },
        utoopack: false,
      },
      cwd,
      env: 'development',
    },
    {
      get(target, property) {
        if (property in target) return target[property as keyof typeof target];

        return vi.fn();
      },
    },
  );

  routesFeature(api);

  expect(addTmpGenerateWatcherPaths.mock.calls[0][0]()).toEqual([
    winPath(
      path.join(
        cwd,
        'components',
        '{*,*/index,*/index.*,*/README,*/README.*}.md',
      ),
    ),
    winPath(path.join(cwd, 'docs', '**/*.md')),
  ]);
});

test('atom route watcher skips demo sidecars', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-routes-'));
  const markdownFiles = [
    'components/standalone.md',
    'components/button/index.md',
    'components/button/index.zh-CN.md',
    'components/button/README.en-US.md',
    'components/button/demo/basic.md',
    'components/button/basic.md',
  ];

  try {
    markdownFiles.forEach((file) => {
      const absPath = path.join(cwd, file);

      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, '# fixture');
    });

    const { watchers } = getTmpGenerateWatchers(cwd);
    const matched = glob
      .sync(watchers[0].path)
      .map((file) => path.relative(cwd, file))
      .sort();

    expect(matched).toEqual([
      path.join('components', 'button', 'README.en-US.md'),
      path.join('components', 'button', 'index.md'),
      path.join('components', 'button', 'index.zh-CN.md'),
      path.join('components', 'standalone.md'),
    ]);
    expect(matched).not.toContain(
      path.join('components', 'button', 'demo', 'basic.md'),
    );
  } finally {
    fs.rmSync(cwd, { force: true, recursive: true });
  }
});
