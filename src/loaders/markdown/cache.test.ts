import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';
import type { IMdLoaderOptions } from '.';

const { transform } = vi.hoisted(() => ({ transform: vi.fn() }));

vi.mock('./transformer', () => ({ default: transform }));

const fixtureDirs: string[] = [];
const legacyModes = [
  'without session',
  'without utoopack',
  'production',
] as const;

beforeAll(() => {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;
  extensions['.ts'] ??= extensions['.js'];
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  transform.mockReset();
  fixtureDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { force: true, recursive: true });
  });
});

function createFixture() {
  const dir = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-loader-cache-')),
  );
  fixtureDirs.push(dir);
  const files = {
    'index.md': '# Documentation',
    'demo.tsx': "import './nested'; export default () => null;",
    'demo.md': 'Demo description',
    'nested.ts': 'export const value = 1;',
    'embedded.md': 'Embedded documentation',
    'loader-context.cjs':
      'exports.techStacks = []; exports.alias = { hydrated: true }; exports.cacheSession = "first-service";',
  };
  Object.entries(files).forEach(([filename, contents]) => {
    fs.writeFileSync(path.join(dir, filename), contents);
  });
  const dependencies = ['demo.tsx', 'demo.md', 'nested.ts', 'embedded.md'];
  transform.mockImplementation(async () => {
    const title = dependencies
      .map((file) => {
        const filePath = path.join(dir, file);
        return fs.existsSync(filePath)
          ? fs.readFileSync(filePath, 'utf-8')
          : `Missing ${file}`;
      })
      .join('\n');

    return {
      content: '<p>Documentation</p>',
      meta: {
        frontmatter: { title, atomId: 'button' },
        toc: [],
        texts: [],
        embeds: [path.join(dir, 'embedded.md')],
        demos: [
          {
            id: 'button-demo',
            component: 'null',
            asset: { id: 'button-demo', dependencies: {} },
            resolveMap: {
              'index.tsx': path.join(dir, 'demo.tsx'),
              './nested.ts': path.join(dir, 'nested.ts'),
            },
            renderOpts: {},
          },
        ],
      },
    };
  });

  return {
    dir,
    setCacheSession(session?: string) {
      const contextFile = path.join(dir, 'loader-context.cjs');
      fs.writeFileSync(
        contextFile,
        `exports.techStacks = []; exports.alias = { hydrated: true }; exports.cacheSession = ${JSON.stringify(
          session,
        )};`,
      );
      delete require.cache[contextFile];
    },
    async restart() {
      // A fresh loader module has no in-memory dependency mapping, just as in
      // a new Utoopack worker. Keep the actual file-system cache on disk.
      vi.resetModules();
      const { _setFSCacheDir } = await import('@/utils');
      _setFSCacheDir(path.join(dir, 'cache'));
      const { default: loader } = await import('.');

      return (overrides: Partial<IMdLoaderOptions> = {}) => {
        const opts = {
          cwd: dir,
          mode: 'frontmatter',
          alias: {},
          resolve: {},
          routes: {},
          locales: [],
          pkg: {},
          builtins: {},
          disableLiveDemo: false,
          __dumiLoaderContextPath: path.join(dir, 'loader-context.cjs'),
          ...overrides,
        } as IMdLoaderOptions;
        const addedDependencies: string[] = [];
        const cacheable = vi.fn();

        return new Promise<{
          output: string;
          addedDependencies: string[];
          cacheable: typeof cacheable;
        }>((resolve, reject) => {
          loader.call(
            {
              resourcePath: path.join(dir, 'index.md'),
              resourceQuery: `?type=${opts.mode}`,
              getOptions: () => opts,
              addDependency: (file: string) => addedDependencies.push(file),
              cacheable,
              async: () => (err: Error | null, output: string) => {
                if (err) reject(err);
                else resolve({ output, addedDependencies, cacheable });
              },
            },
            files['index.md'],
          );
        });
      };
    },
  };
}

function createLegacyFixture(kind: (typeof legacyModes)[number]) {
  const fixture = createFixture();
  if (kind === 'production') vi.stubEnv('NODE_ENV', 'production');
  else if (kind === 'without session') fixture.setCacheSession(undefined);

  const overrides =
    kind === 'without utoopack'
      ? ({ __dumiLoaderContextPath: undefined } as any)
      : {};

  return { fixture, overrides };
}

test('markdown workers in one service reuse disk cache across modes', async () => {
  const fixture = createFixture();
  const initial = await (await fixture.restart())();
  const load = await fixture.restart();
  const cached = await load();
  const demoIndex = await load({ mode: 'demo-index' });

  expect(transform).toHaveBeenCalledTimes(1);
  expect(transform.mock.calls[0][1].alias).toEqual({ hydrated: true });
  expect(await transform.mock.results[0].value).not.toHaveProperty(
    '__dumiCacheSession',
  );
  expect(cached.output).toBe(initial.output);
  expect(cached.output).not.toContain('__dumiCacheSession');
  expect(cached.addedDependencies).toContain(path.join(fixture.dir, 'demo.md'));
  expect(cached.addedDependencies).toContain(
    path.join(fixture.dir, 'embedded.md'),
  );
  expect(demoIndex.output).toContain('button-demo');
  expect(demoIndex.addedDependencies).not.toContain(
    path.join(fixture.dir, 'demo.tsx'),
  );
});

test('a new service refreshes custom plugin output in retained workers', async () => {
  const fixture = createFixture();
  const load = await fixture.restart();
  const initial = await load();
  const previousImplementation = transform.getMockImplementation()!;
  transform.mockImplementation(async (...args) => {
    const result = await previousImplementation(...args);
    result.meta.frontmatter.title = 'Updated plugin output';
    return result;
  });
  fixture.setCacheSession('next-service');
  const refreshed = await load();
  const nextWorker = await (await fixture.restart())();

  expect(transform).toHaveBeenCalledTimes(2);
  expect(refreshed.output).not.toBe(initial.output);
  expect(refreshed.output).toContain('Updated plugin output');
  expect(nextWorker.output).toBe(refreshed.output);
  expect(
    fs.readdirSync(path.join(fixture.dir, 'cache/md-loader')),
  ).toHaveLength(2);
});

test('a late previous-service transform cannot poison the current service cache', async () => {
  const fixture = createFixture();
  const load = await fixture.restart();
  const implementation = transform.getMockImplementation()!;
  let finishPrevious!: () => void;
  const previousDone = new Promise<void>((resolve) => {
    finishPrevious = resolve;
  });
  transform.mockImplementationOnce(async (...args) => {
    const result = await implementation(...args);
    result.meta.frontmatter.title = 'Previous plugin output';
    await previousDone;
    return result;
  });
  const previous = load();
  fixture.setCacheSession('next-service');
  const current = await load();
  finishPrevious();
  const stale = await previous;
  const nextWorker = await (await fixture.restart())();

  expect(transform).toHaveBeenCalledTimes(3);
  expect(stale.output).toContain('Previous plugin output');
  expect(nextWorker.output).toBe(current.output);
  expect(nextWorker.output).not.toContain('Previous plugin output');
});

test.each([undefined, 'another-service'])(
  'current workers reject dependency results with session %s',
  async (cachedSession) => {
    const fixture = createFixture();
    const initial = await (await fixture.restart())();
    const cacheDir = path.join(fixture.dir, 'cache/md-loader');
    const resultFile = fs.readdirSync(cacheDir).find((filename) => {
      const contents = JSON.parse(
        fs.readFileSync(path.join(cacheDir, filename), 'utf-8'),
      );
      return contents.value?.meta;
    })!;
    const resultPath = path.join(cacheDir, resultFile);
    const contents = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
    contents.value.__dumiCacheSession = cachedSession;
    contents.value.meta.frontmatter.title = 'Unexpected cached plugin output';
    fs.writeFileSync(resultPath, JSON.stringify(contents));
    const refreshed = await (await fixture.restart())();

    expect(transform).toHaveBeenCalledTimes(2);
    expect(refreshed.output).toBe(initial.output);
    expect(refreshed.output).not.toContain('Unexpected cached plugin output');
  },
);

test.each(['another service', 'invalid paths', 'legacy index'])(
  'workers reject a dependency index from %s',
  async (kind) => {
    const fixture = createFixture();
    const initial = await (await fixture.restart())();
    const cacheDir = path.join(fixture.dir, 'cache/md-loader');
    const indexFile = fs.readdirSync(cacheDir).find((filename) => {
      const contents = JSON.parse(
        fs.readFileSync(path.join(cacheDir, filename), 'utf-8'),
      );
      return Array.isArray(contents.value?.deps);
    })!;
    const indexPath = path.join(cacheDir, indexFile);
    const contents = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    if (kind === 'another service') {
      contents.value.cacheSession = 'another-service';
    } else if (kind === 'invalid paths') {
      contents.value.deps = [42];
    } else {
      contents.value = contents.value.deps;
    }
    fs.writeFileSync(indexPath, JSON.stringify(contents));
    const refreshed = await (await fixture.restart())();

    expect(transform).toHaveBeenCalledTimes(2);
    expect(refreshed.output).toBe(initial.output);
  },
);

test('a new service preserves existing cache hits for documents without dependencies', async () => {
  const fixture = createFixture();
  transform.mockResolvedValue({
    content: '<p>Documentation</p>',
    meta: {
      frontmatter: { title: 'No dependencies' },
      toc: [],
      texts: [],
      embeds: [],
      demos: [],
    },
  });
  const initial = await (await fixture.restart())();
  fixture.setCacheSession('next-service');
  const cached = await (await fixture.restart())();

  expect(transform).toHaveBeenCalledTimes(1);
  expect(cached.output).toBe(initial.output);
});

test.each(legacyModes)(
  'markdown loaders %s keep their existing process-local dependency mapping',
  async (kind) => {
    const { fixture, overrides } = createLegacyFixture(kind);
    const load = await fixture.restart();
    const { getCache } = await import('@/utils');
    const read = vi.spyOn(getCache('md-loader'), 'getSync');
    await load(overrides);
    await load(overrides);
    expect(transform).toHaveBeenCalledTimes(1);
    expect(read.mock.calls.map((call) => call[1])).toEqual(['', '']);
    await (
      await fixture.restart()
    )(overrides);

    expect(transform).toHaveBeenCalledTimes(2);
    expect(
      fs.readdirSync(path.join(fixture.dir, 'cache/md-loader')),
    ).toHaveLength(1);
    const cacheFile = fs.readdirSync(
      path.join(fixture.dir, 'cache/md-loader'),
    )[0];
    const { value } = JSON.parse(
      fs.readFileSync(
        path.join(fixture.dir, 'cache/md-loader', cacheFile),
        'utf-8',
      ),
    );
    expect(value).not.toHaveProperty('__dumiCacheSession');
  },
);

test.each(legacyModes)(
  'markdown loaders %s preserve master dependency invalidation',
  async (kind) => {
    const { fixture, overrides } = createLegacyFixture(kind);
    const load = await fixture.restart();
    const initial = await load(overrides);
    fs.writeFileSync(path.join(fixture.dir, 'demo.tsx'), 'Updated dependency');
    const updated = await load(overrides);

    expect(transform).toHaveBeenCalledTimes(2);
    expect(updated.output).not.toBe(initial.output);
    expect(updated.output).toContain('Updated dependency');
  },
);

test.each(legacyModes)(
  'markdown loaders %s preserve master caching when a sidecar is added',
  async (kind) => {
    const { fixture, overrides } = createLegacyFixture(kind);
    fs.unlinkSync(path.join(fixture.dir, 'demo.md'));
    const load = await fixture.restart();
    const initial = await load(overrides);
    fs.writeFileSync(
      path.join(fixture.dir, 'demo.md'),
      'New sidecar description',
    );
    const cached = await load(overrides);

    // Master hashes only its previously collected dependency paths. A new
    // sidecar is parsed after restarting the worker, not on this cache hit.
    expect(transform).toHaveBeenCalledTimes(1);
    expect(cached.output).toBe(initial.output);
    const refreshed = await (await fixture.restart())(overrides);
    expect(transform).toHaveBeenCalledTimes(2);
    expect(refreshed.output).toContain('New sidecar description');
  },
);

test.each(legacyModes)(
  'markdown loaders %s preserve master errors for missing known dependencies',
  async (kind) => {
    const { fixture, overrides } = createLegacyFixture(kind);
    const load = await fixture.restart();
    await load(overrides);
    fs.unlinkSync(path.join(fixture.dir, 'demo.tsx'));

    await expect(load(overrides)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(transform).toHaveBeenCalledTimes(1);
  },
);

test.each(legacyModes)(
  'markdown loaders %s preserve master dependency key order and duplicates',
  async (kind) => {
    const { fixture, overrides } = createLegacyFixture(kind);
    const implementation = transform.getMockImplementation()!;
    transform.mockImplementation(async (...args) => {
      const result = await implementation(...args);
      result.meta.embeds.push(...result.meta.embeds);
      return result;
    });
    const load = await fixture.restart();
    const { getCache } = await import('@/utils');
    const write = vi.spyOn(getCache('md-loader'), 'setSync');
    await load(overrides);
    const key = write.mock.calls[0][0];
    const dependencies = JSON.parse(key.slice(key.lastIndexOf(':[') + 1));

    expect(write).toHaveBeenCalledTimes(1);
    expect(
      dependencies.map((entry: string) =>
        entry.slice(0, entry.lastIndexOf(':')),
      ),
    ).toEqual(
      ['embedded.md', 'embedded.md', 'demo.tsx', 'demo.md', 'nested.ts'].map(
        (file) => path.join(fixture.dir, file),
      ),
    );
  },
);

test.each(['demo.tsx', 'nested.ts', 'demo.md', 'embedded.md'])(
  'fresh markdown loaders invalidate disk cache when %s changes',
  async (filename) => {
    const fixture = createFixture();
    const initial = await (await fixture.restart())();
    fs.writeFileSync(path.join(fixture.dir, filename), 'Updated dependency');
    const updated = await (await fixture.restart())();

    expect(transform).toHaveBeenCalledTimes(2);
    expect(updated.output).not.toBe(initial.output);
    expect(updated.output).toContain('Updated dependency');
  },
);

test('fresh markdown loaders discover newly added demo sidecars', async () => {
  const fixture = createFixture();
  fs.unlinkSync(path.join(fixture.dir, 'demo.md'));
  await (
    await fixture.restart()
  )();
  fs.writeFileSync(
    path.join(fixture.dir, 'demo.md'),
    'New sidecar description',
  );
  const updated = await (await fixture.restart())();

  expect(transform).toHaveBeenCalledTimes(2);
  expect(updated.output).toContain('New sidecar description');
  expect(updated.addedDependencies).toContain(
    path.join(fixture.dir, 'demo.md'),
  );
});

test.each(['demo.tsx', 'demo.md', 'embedded.md'])(
  'fresh markdown loaders safely miss disk cache when %s is removed',
  async (filename) => {
    const fixture = createFixture();
    await (
      await fixture.restart()
    )();
    fs.unlinkSync(path.join(fixture.dir, filename));
    const updated = await (await fixture.restart())();

    expect(transform).toHaveBeenCalledTimes(2);
    expect(updated.output).toContain(`Missing ${filename}`);

    await (
      await fixture.restart()
    )();
    expect(transform).toHaveBeenCalledTimes(filename === 'demo.md' ? 2 : 3);
  },
);

test('a malformed dependency index is treated as a cache miss', async () => {
  const fixture = createFixture();
  await (
    await fixture.restart()
  )();
  const cacheDir = path.join(fixture.dir, 'cache/md-loader');
  const indexFile = fs.readdirSync(cacheDir).find((filename) => {
    const contents = JSON.parse(
      fs.readFileSync(path.join(cacheDir, filename), 'utf-8'),
    );
    return Array.isArray(contents.value?.deps);
  })!;
  fs.writeFileSync(path.join(cacheDir, indexFile), '{');
  await (
    await fixture.restart()
  )();

  expect(transform).toHaveBeenCalledTimes(2);
});

test('production preserves master caching and emits asset hooks for every load', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  const fixture = createFixture();
  const hooks = {
    mode: 'markdown' as const,
    onResolveDemos: vi.fn(),
    onResolveAtomMeta: vi.fn(),
    demoAssetsFile: path.join(fixture.dir, 'assets.jsonl'),
  };
  const load = await fixture.restart();
  const initial = await load(hooks);
  const cached = await load(hooks);
  const freshWorker = await (await fixture.restart())(hooks);

  expect(transform).toHaveBeenCalledTimes(2);
  expect(cached.output).toBe(initial.output);
  expect(freshWorker.output).toBe(initial.output);
  expect(hooks.onResolveDemos).toHaveBeenCalledTimes(3);
  expect(hooks.onResolveAtomMeta).toHaveBeenCalledTimes(3);
  expect(initial.cacheable).toHaveBeenCalledWith(false);
  expect(cached.cacheable).toHaveBeenCalledWith(false);
  expect(freshWorker.cacheable).toHaveBeenCalledWith(false);
  expect(
    fs.readFileSync(hooks.demoAssetsFile, 'utf-8').trim().split('\n'),
  ).toHaveLength(3);
});

test('disabling dumi cache also disables the persisted dependency index', async () => {
  vi.stubEnv('DUMI_CACHE', 'none');
  const fixture = createFixture();
  await (
    await fixture.restart()
  )();
  const load = await fixture.restart();
  await load();
  await load();

  expect(transform).toHaveBeenCalledTimes(3);
  expect(fs.existsSync(path.join(fixture.dir, 'cache'))).toBe(false);
});

test('disabling dumi cache preserves master errors for missing dependencies', async () => {
  vi.stubEnv('DUMI_CACHE', 'none');
  const fixture = createFixture();
  const load = await fixture.restart();
  await load();
  fs.unlinkSync(path.join(fixture.dir, 'demo.tsx'));

  await expect(load()).rejects.toMatchObject({ code: 'ENOENT' });
  expect(transform).toHaveBeenCalledTimes(1);
  expect(fs.existsSync(path.join(fixture.dir, 'cache'))).toBe(false);
});
