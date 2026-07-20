import fs from 'fs';
import os from 'os';
import path from 'path';
import { glob, winPath } from 'umi/plugin-utils';
import { vi } from 'vitest';
import routesFeature from './routes';

function getTmpGenerateWatcherPaths(
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
      },
      cwd,
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
    paths: addTmpGenerateWatcherPaths.mock.calls[0][0](),
  };
}

test('tmp generation watches only routable markdown files in atom directories', () => {
  const { cwd, paths } = getTmpGenerateWatcherPaths();

  expect(paths).toEqual([
    winPath(
      path.join(
        cwd,
        'components',
        '{*,*/index,*/index.*,*/README,*/README.*}.md',
      ),
    ),
    winPath(path.join(cwd, 'docs', '**/*.md')),
    winPath(path.join(cwd, 'guides', '**/*.md')),
  ]);
  expect(paths).not.toContain(winPath(path.join(cwd, 'components', '**/*.md')));
});

test('tmp generation watcher globs use portable path separators', () => {
  const { paths } = getTmpGenerateWatcherPaths(
    String.raw`C:\workspace\dumi-app`,
  );

  expect(paths).toEqual([
    'C:/workspace/dumi-app/components/{*,*/index,*/index.*,*/README,*/README.*}.md',
    'C:/workspace/dumi-app/docs/**/*.md',
    'C:/workspace/dumi-app/guides/**/*.md',
  ]);
});

test('atom route watcher covers route metadata changes but skips demo sidecars', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-routes-'));
  const markdownFiles = [
    'components/standalone.md',
    'components/button/index.md',
    'components/button/index.zh-CN.md',
    'components/button/README.en-US.md',
    'components/button/demo/basic.md',
    'components/button/basic.md',
    'docs/guide/getting-started.md',
  ];

  try {
    markdownFiles.forEach((file) => {
      const absPath = path.join(cwd, file);

      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, '# fixture');
    });

    const { paths } = getTmpGenerateWatcherPaths(cwd);
    const matched = glob
      .sync(paths[0])
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
    expect(glob.sync(paths[1]).map((file) => path.relative(cwd, file))).toEqual(
      [path.join('docs', 'guide', 'getting-started.md')],
    );
  } finally {
    fs.rmSync(cwd, { force: true, recursive: true });
  }
});
