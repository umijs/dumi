import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';

let getDemoSourceFiles: typeof import('.')['getDemoSourceFiles'];
let getMdLoaderCacheSync: typeof import('.')['getMdLoaderCacheSync'];
let emitDefault: typeof import('.')['emitDefault'];
let emitFrontmatter: typeof import('.')['emitFrontmatter'];
let emitRenderText: typeof import('.')['emitRenderText'];
let emitText: typeof import('.')['emitText'];

function registerTsResolveExtension() {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;

  extensions['.ts'] ??= extensions['.js'];
}

beforeAll(async () => {
  registerTsResolveExtension();
  ({
    emitDefault,
    emitFrontmatter,
    emitRenderText,
    emitText,
    getDemoSourceFiles,
    getMdLoaderCacheSync,
  } = await import('.'));
});

test('utoopack frontmatter self-accepts text-only markdown updates', () => {
  const output = emitFrontmatter.call(
    { resourcePath: '/docs/button.md' },
    {
      cwd: '/docs',
      locales: [],
      routes: {
        'docs/button': { id: 'docs/button', file: '/docs/button.md' },
      },
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        frontmatter: { title: 'Button' },
        toc: [{ id: 'usage', title: 'Usage', depth: 2 }],
        demos: [],
      },
    } as any,
  );

  expect(output).toContain('const hot = import.meta.turbopackHot;');
  expect(output).toContain('hot.accept();');
  expect(output).not.toContain('__turbopack_context__');
  expect(output).toContain('Object.assign(frontmatter, nextFrontmatter)');
  expect(output).toContain('toc.splice(0, toc.length, ...nextToc)');
  expect(output).toContain('if (didRouteStructureChange)');
  expect(output).toContain('hot.invalidate();');
  expect(output).toContain('notifyRouteMetaHMR("docs/button")');
  expect(output).toMatch(/export const routeStructureHash = '[a-f0-9]+';/);
});

test('non-utoopack frontmatter keeps existing output without HMR runtime', () => {
  const output = emitFrontmatter.call(
    { resourcePath: '/docs/button.md' },
    { cwd: '/docs', locales: [] } as any,
    {
      meta: {
        frontmatter: { title: 'Button' },
        toc: [],
        demos: [],
      },
    } as any,
  );

  expect(output).not.toContain('import.meta.turbopackHot');
  expect(output).not.toContain('notifyRouteMetaHMR');
});

test('utoopack frontmatter invalidates when a route id is unavailable', () => {
  const output = emitFrontmatter.call(
    { resourcePath: '/docs/detached.md' },
    {
      cwd: '/docs',
      locales: [],
      routes: {},
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        frontmatter: { title: 'Detached' },
        toc: [],
        demos: [],
      },
    } as any,
  );

  expect(output).toContain('else if (hadPreviousMeta)');
  expect(output).not.toContain('notifyRouteMetaHMR(');
});

test('utoopack text metadata self-accepts and preserves its array reference', () => {
  const output = emitText.call(
    { resourcePath: '/docs/button.md' },
    {
      cwd: '/docs',
      locales: [],
      routes: {
        'docs/button': { id: 'docs/button', file: '/docs/button.md' },
      },
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        texts: [{ type: 'text', value: 'Button content' }],
      },
    } as any,
  );

  expect(output).toContain('const hot = import.meta.turbopackHot;');
  expect(output).toContain('hot.accept();');
  expect(output).not.toContain('__turbopack_context__');
  expect(output).toContain('texts.splice(0, texts.length, ...nextTexts)');
  expect(output).toContain('notifyRouteMetaHMR("docs/button")');
});

test('utoopack Markdown component uses a separate render text dependency', () => {
  const output = emitDefault.call(
    { resourcePath: '/docs/button.md' },
    {
      builtins: {},
      cwd: '/docs',
      locales: [],
      routes: {
        'docs/button': { id: 'docs/button', file: '/docs/button.md' },
      },
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      content: '<p>{$$contentTexts[0].value}</p>',
      meta: { demos: [], frontmatter: {} },
    } as any,
  );

  expect(output).toContain('/docs/button.md?type=text-render');
  expect(output).not.toContain('subscribeRouteMetaHMR');
});

test('non-utoopack Markdown component keeps the existing text dependency', () => {
  const output = emitDefault.call(
    { resourcePath: '/docs/button.md' },
    {
      builtins: {},
      cwd: '/docs',
      locales: [],
    } as any,
    {
      content: '<p>{$$contentTexts[0].value}</p>',
      meta: { demos: [], frontmatter: {} },
    } as any,
  );

  expect(output).toContain('/docs/button.md?type=text');
  expect(output).not.toContain('type=text-render');
});

test('utoopack render text dependency propagates to React Refresh', () => {
  const output = emitRenderText.call(
    { resourcePath: '/docs/button.md' },
    { cwd: '/docs', locales: [], mode: 'text-render' } as any,
    {
      meta: {
        texts: [{ type: 'text', value: 'Button content' }],
      },
    } as any,
  );

  expect(output).toContain('export const texts =');
  expect(output).not.toContain('import.meta.turbopackHot');
  expect(output).not.toContain('notifyRouteMetaHMR');
});

test('non-utoopack text metadata keeps existing output', () => {
  const output = emitText.call(
    { resourcePath: '/docs/button.md' },
    { cwd: '/docs', locales: [] } as any,
    { meta: { texts: [] } } as any,
  );

  expect(output).not.toContain('import.meta.turbopackHot');
  expect(output).not.toContain('notifyRouteMetaHMR');
});

test('utoopack production keeps the existing markdown module identities', () => {
  vi.stubEnv('NODE_ENV', 'production');

  try {
    const opts = {
      builtins: {},
      cwd: '/docs',
      locales: [],
      routes: {
        'docs/button': { id: 'docs/button', file: '/docs/button.md' },
      },
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any;
    const ret = {
      content: '<p>{$$contentTexts[0].value}</p>',
      meta: {
        demos: [],
        frontmatter: { title: 'Button' },
        texts: [{ type: 'text', value: 'Button content' }],
        toc: [],
      },
    } as any;

    const pageOutput = emitDefault.call(
      { resourcePath: '/docs/button.md' },
      opts,
      ret,
    );
    const frontmatterOutput = emitFrontmatter.call(
      { resourcePath: '/docs/button.md' },
      opts,
      ret,
    );
    const textOutput = emitText.call(
      { resourcePath: '/docs/button.md' },
      opts,
      ret,
    );

    expect(pageOutput).toContain('/docs/button.md?type=text');
    expect(pageOutput).not.toContain('type=text-render');
    expect(frontmatterOutput).not.toContain('import.meta.turbopackHot');
    expect(frontmatterOutput).not.toContain('routeStructureHash');
    expect(textOutput).not.toContain('import.meta.turbopackHot');
  } finally {
    vi.unstubAllEnvs();
  }
});

test('markdown loader reads md-loader cache', () => {
  const cache = {
    getSync: vi.fn(() => 'cached'),
  };

  expect(getMdLoaderCacheSync(cache, 'key', '')).toBe('cached');
  expect(cache.getSync).toHaveBeenCalledWith('key', '');
});

test('markdown loader treats malformed md-loader cache as missed', () => {
  const cache = {
    getSync: vi.fn(() => {
      throw new SyntaxError('Unexpected end of JSON input');
    }),
  };

  expect(getMdLoaderCacheSync(cache, 'key', 'fallback')).toBe('fallback');
});

test('markdown loader rethrows non-json cache errors', () => {
  const cache = {
    getSync: vi.fn(() => {
      throw new Error('EACCES: permission denied');
    }),
  };

  expect(() => getMdLoaderCacheSync(cache, 'key', '')).toThrow(
    'EACCES: permission denied',
  );
});

test('markdown loader tracks external demo sidecar markdown files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-source-'));
  const demoFile = path.join(dir, 'basic.tsx');
  const demoMdFile = path.join(dir, 'basic.md');

  fs.writeFileSync(demoFile, 'export default () => null;');
  fs.writeFileSync(demoMdFile, '## zh-CN\n\nDemo description');

  try {
    expect(
      getDemoSourceFiles([
        {
          id: 'button-demo-basic',
          resolveMap: {
            'index.tsx': demoFile,
          },
        } as any,
      ]),
    ).toEqual([demoFile, demoMdFile]);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
