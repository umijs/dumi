import type { IDumiTechStack } from '@/types';
import { create } from 'enhanced-resolve';
import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { winPath } from 'umi/plugin-utils';
import { vi } from 'vitest';

let parseBlockAsset: typeof import('./block')['default'];
const fixtureDirs: string[] = [];

beforeAll(async () => {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;
  extensions['.ts'] ??= extensions['.js'];
  parseBlockAsset = (await import('./block')).default;
});

afterEach(() => {
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

  const onBlockLoad = vi.fn(() => null);
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
    parse: (collectSideEffectStyles = true) =>
      parseBlockAsset({ ...opts, collectSideEffectStyles }),
    style: winPath(path.join(dir, 'style.less')),
  };
}

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
