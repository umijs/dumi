import type { IDumiTechStack } from '@/types';
import { create } from 'enhanced-resolve';
import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { winPath } from 'umi/plugin-utils';
import { vi } from 'vitest';

const swc: typeof import('@swc/core') = require('@swc/core');
const parseSync = vi.spyOn(swc, 'parseSync');

let parseBlockAsset: typeof import('./block')['default'];
const fixtureDirs: string[] = [];

beforeAll(async () => {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;
  extensions['.ts'] ??= extensions['.js'];
  parseBlockAsset = (await import('./block')).default;
});

afterAll(() => {
  parseSync.mockRestore();
});

afterEach(() => {
  vi.mocked(parseSync).mockClear();
  vi.unstubAllEnvs();
  fixtureDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

function createFixture(files: Record<string, string>) {
  const dir = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-block-style-cache-')),
  );
  fixtureDirs.push(dir);
  Object.entries(files).forEach(([filename, content]) => {
    const file = path.join(dir, filename);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  });

  const onBlockLoad = vi.fn<NonNullable<IDumiTechStack['onBlockLoad']>>(
    () => null,
  );
  const techStack: IDumiTechStack = {
    name: 'style-cache-test',
    runtimeOpts: { compilePath: path.join(dir, 'compiler.js') },
    isSupported: () => true,
    transformCode: (code) => code,
    onBlockLoad,
  };
  const opts = {
    fileAbsPath: path.join(dir, 'demo.ts'),
    id: 'style-cache-test',
    refAtomIds: [],
    resolver: create.sync({ extensions: ['.ts', '.less'] }),
    techStack,
    cacheable: true,
  };

  return {
    dir,
    onBlockLoad,
    parse: (collectSideEffectStyles = true, cacheable = true) =>
      parseBlockAsset({ ...opts, collectSideEffectStyles, cacheable }),
    style: winPath(path.join(dir, 'style.less')),
  };
}

test('uncached production blocks reuse import analysis while running custom loaders', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  const shared =
    "import './style.less';\nexport const shared = 'production-import-analysis';";
  const fixture = createFixture({
    'demo.ts':
      "import './shared';\nexport default 'production-import-analysis';",
    'shared.ts': shared,
    'style.less': '.demo { color: red; }',
  });
  const initial = await fixture.parse(true, false);
  const loadCount = fixture.onBlockLoad.mock.calls.length;
  const repeated = await fixture.parse(true, false);

  expect(initial.sideEffectStyles).toEqual([fixture.style]);
  expect(initial.asset.dependencies['./shared.ts'].value).toBe(shared);
  expect(repeated).toEqual(initial);
  expect(fixture.onBlockLoad).toHaveBeenCalledTimes(loadCount * 2);
  expect(
    vi.mocked(parseSync).mock.calls.filter(([code]) => code === shared),
  ).toHaveLength(1);
});

test('import analysis follows custom loader output without changing displayed sources', async () => {
  const raw = "export default 'custom-import-analysis';";
  const fixture = createFixture({
    'demo.ts': raw,
    'style.less': '.demo { color: red; }',
  });
  const sideEffect =
    "import './style.less';\nexport default 'custom-import-analysis';";
  const namespace =
    "import styles from './style.less';\nexport default styles; // custom-import-analysis";
  let transformed = sideEffect;
  fixture.onBlockLoad.mockImplementation(({ path: filename }) =>
    filename.endsWith('demo.ts') ? { type: 'ts', content: transformed } : null,
  );

  expect((await fixture.parse(true, false)).sideEffectStyles).toEqual([
    fixture.style,
  ]);
  const loadCount = fixture.onBlockLoad.mock.calls.length;
  transformed = namespace;
  const updated = await fixture.parse(true, false);
  const repeated = await fixture.parse(true, false);

  expect(updated.sideEffectStyles).toEqual([]);
  expect(updated.asset.dependencies['index.ts'].value).toBe(raw);
  expect(repeated).toEqual(updated);
  expect(fixture.onBlockLoad).toHaveBeenCalledTimes(loadCount * 3);
  expect(vi.mocked(parseSync).mock.calls.map(([code]) => code)).toEqual([
    sideEffect,
    namespace,
  ]);
});

test('import analysis separates parser extensions for identical transformed code', async () => {
  const transformed =
    "import './style.less';\nexport default 'parser-extension-analysis';";
  const fixture = createFixture({
    'demo.ts': transformed,
    'style.less': '.demo { color: red; }',
  });
  let extension = 'ts';
  fixture.onBlockLoad.mockImplementation(({ path: filename }) =>
    filename.endsWith('demo.ts')
      ? { type: extension, content: transformed }
      : null,
  );
  const initial = await fixture.parse(true, false);
  extension = 'tsx';
  const changed = await fixture.parse(true, false);
  const repeated = await fixture.parse(true, false);

  expect(changed).toEqual(initial);
  expect(repeated).toEqual(initial);
  expect(changed.sideEffectStyles).toEqual([fixture.style]);
  expect(vi.mocked(parseSync).mock.calls.map(([, options]) => options)).toEqual(
    [
      { syntax: 'typescript', tsx: false, decorators: true },
      { syntax: 'typescript', tsx: true, decorators: true },
    ],
  );
});

test('DUMI_CACHE=none bypasses import analysis cache reads and writes', async () => {
  vi.stubEnv('DUMI_CACHE', 'none');
  const code =
    "import './style.less';\nexport default 'disabled-import-analysis-cache';";
  const fixture = createFixture({
    'demo.ts': code,
    'style.less': '.demo { color: red; }',
  });
  const initial = await fixture.parse(true, false);
  const loadCount = fixture.onBlockLoad.mock.calls.length;
  await fixture.parse(true, false);
  expect(vi.mocked(parseSync)).toHaveBeenCalledTimes(2);

  vi.stubEnv('DUMI_CACHE', 'enabled');
  await fixture.parse(true, false);
  expect(vi.mocked(parseSync)).toHaveBeenCalledTimes(3);
  await fixture.parse(true, false);
  expect(vi.mocked(parseSync)).toHaveBeenCalledTimes(3);

  vi.stubEnv('DUMI_CACHE', 'none');
  const uncached = await fixture.parse(true, false);
  expect(vi.mocked(parseSync)).toHaveBeenCalledTimes(4);
  expect(uncached).toEqual(initial);
  expect(fixture.onBlockLoad).toHaveBeenCalledTimes(loadCount * 5);
});

test('import analysis bounds retained module count in large dependency graphs', async () => {
  const entry = `${Array.from(
    { length: 520 },
    (_, index) => `import './module-${index}';`,
  ).join('\n')}\nexport default 'bounded-entry-import-analysis';`;
  const fixture = createFixture({
    'demo.ts': entry,
    ...Object.fromEntries(
      Array.from({ length: 520 }, (_, index) => [
        `module-${index}.ts`,
        `export default ${index}; // bounded-entry-import-analysis`,
      ]),
    ),
  });
  const initial = await fixture.parse(true, false);
  const repeated = await fixture.parse(true, false);

  expect(repeated).toEqual(initial);
  expect(Object.keys(repeated.asset.dependencies)).toHaveLength(521);
  expect(
    vi.mocked(parseSync).mock.calls.filter(([code]) => code === entry),
  ).toHaveLength(2);
});

test('import analysis bounds retained source size for large modules', async () => {
  const entry = `${Array.from(
    { length: 5 },
    (_, index) => `import './module-${index}';`,
  ).join('\n')}\nexport default 'bounded-source-import-analysis';`;
  const fixture = createFixture({
    'demo.ts': entry,
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, index) => [
        `module-${index}.ts`,
        `export default ${index}; /*${'x'.repeat(300000)}*/`,
      ]),
    ),
  });
  const initial = await fixture.parse(true, false);
  const repeated = await fixture.parse(true, false);

  expect(repeated).toEqual(initial);
  expect(Object.keys(repeated.asset.dependencies)).toHaveLength(6);
  expect(
    vi.mocked(parseSync).mock.calls.filter(([code]) => code === entry),
  ).toHaveLength(2);
});

test('block cache updates style usage when the entry import changes', async () => {
  const fixture = createFixture({
    'demo.ts': "import './style.less';\nexport default 1;",
    'style.less': '.demo { color: red; }',
  });

  expect((await fixture.parse()).sideEffectStyles).toContain(fixture.style);

  const entry = "import styles from './style.less';\nexport default styles;";
  fs.writeFileSync(path.join(fixture.dir, 'demo.ts'), entry);
  const result = await fixture.parse();

  expect(result.sideEffectStyles ?? []).not.toContain(fixture.style);
  expect(result.asset.dependencies['index.ts'].value).toBe(entry);
});

test('block cache updates style usage when only a nested import changes', async () => {
  const fixture = createFixture({
    'demo.ts': "import './nested';\nexport default 1;",
    'nested.ts': "import './style.less';",
    'style.less': '.demo { color: red; }',
  });
  const initial = await fixture.parse();

  expect(initial.sideEffectStyles).toContain(fixture.style);
  expect(Object.values(initial.resolveMap).map(winPath)).toContain(
    winPath(path.join(fixture.dir, 'nested.ts')),
  );

  const nested = "import styles from './style.less';\nexport default styles;";
  fs.writeFileSync(path.join(fixture.dir, 'nested.ts'), nested);
  const result = await fixture.parse();

  expect(result.sideEffectStyles ?? []).not.toContain(fixture.style);
  expect(result.asset.dependencies['./nested.ts'].value).toBe(nested);
  expect(result.asset.dependencies['index.ts'].value).toBe(
    initial.asset.dependencies['index.ts'].value,
  );
});

test('mutating returned side-effect styles does not change a cached block', async () => {
  const fixture = createFixture({
    'demo.ts': "import './style.less';\nexport default 1;",
    'style.less': '.demo { color: red; }',
  });
  const initial = await fixture.parse();
  const loadCount = fixture.onBlockLoad.mock.calls.length;

  expect(initial.sideEffectStyles).toEqual([fixture.style]);
  initial.sideEffectStyles!.splice(0, 1, 'mutated-style.less');

  const cached = await fixture.parse();

  expect(fixture.onBlockLoad).toHaveBeenCalledTimes(loadCount);
  expect(cached.sideEffectStyles).toEqual([fixture.style]);
  expect(cached.sideEffectStyles).not.toBe(initial.sideEffectStyles);

  cached.sideEffectStyles!.push('another-mutation.less');
  expect((await fixture.parse()).sideEffectStyles).toEqual([fixture.style]);
  expect(fixture.onBlockLoad).toHaveBeenCalledTimes(loadCount);
});

test('block cache isolates opt-in style metadata from ordinary parsing', async () => {
  const fixture = createFixture({
    'demo.ts': "import './style.less';\nexport default 1;",
    'style.less': '.demo { color: red; }',
  });
  const ordinary = await fixture.parse(false);
  const ordinaryLoadCount = fixture.onBlockLoad.mock.calls.length;

  expect(ordinary.sideEffectStyles ?? []).toEqual([]);

  const collected = await fixture.parse(true);
  const collectedLoadCount = fixture.onBlockLoad.mock.calls.length;

  expect(collected.sideEffectStyles).toEqual([fixture.style]);
  expect(collectedLoadCount).toBeGreaterThan(ordinaryLoadCount);
  expect(collected.asset).toEqual(ordinary.asset);
  expect(collected.resolveMap).toEqual(ordinary.resolveMap);

  expect((await fixture.parse(false)).sideEffectStyles ?? []).toEqual([]);
  expect(fixture.onBlockLoad).toHaveBeenCalledTimes(collectedLoadCount);
  expect((await fixture.parse(true)).sideEffectStyles).toEqual([fixture.style]);
  expect(fixture.onBlockLoad).toHaveBeenCalledTimes(collectedLoadCount);
});
