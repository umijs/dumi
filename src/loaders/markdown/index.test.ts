import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';

let getDemoSourceFiles: typeof import('.')['getDemoSourceFiles'];
let getDemoWatchFiles: typeof import('.')['getDemoWatchFiles'];
let addMdResultDependencies: typeof import('.')['addMdResultDependencies'];
let getMdLoaderCacheSync: typeof import('.')['getMdLoaderCacheSync'];
let getMdLoaderCacheResult: typeof import('.')['getMdLoaderCacheResult'];
let getDepsCacheKey: typeof import('.')['getDepsCacheKey'];
let getMdTransformCacheKeys: typeof import('.')['getMdTransformCacheKeys'];
let addDemoFileDependency: typeof import('.')['addDemoFileDependency'];
let createStableTransform: typeof import('.')['createStableTransform'];
let createDependencyReader: typeof import('.')['createDependencyReader'];
let emitDemo: typeof import('.')['emitDemo'];
let emitFrontmatter: typeof import('.')['emitFrontmatter'];
let renderDemoIndex: typeof import('.')['renderDemoIndex'];

function registerTsResolveExtension() {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;

  extensions['.ts'] ??= extensions['.js'];
}

beforeAll(async () => {
  registerTsResolveExtension();
  ({
    addDemoFileDependency,
    addMdResultDependencies,
    createDependencyReader,
    createStableTransform,
    emitDemo,
    emitFrontmatter,
    getDemoSourceFiles,
    getDemoWatchFiles,
    getDepsCacheKey,
    getMdLoaderCacheResult,
    getMdLoaderCacheSync,
    getMdTransformCacheKeys,
    renderDemoIndex,
  } = await import('.'));
});

test('utoopack frontmatter does not retain demo chunk references', () => {
  const output = emitFrontmatter.call(
    { resourcePath: '/docs/button.md' },
    {
      cwd: '/docs',
      locales: [],
      useUtoopackDemoHMR: true,
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        frontmatter: { title: 'Button' },
        toc: [],
        demos: [{ id: 'button-demo-basic' }],
      },
    } as any,
  );

  expect(output).toContain('export const frontmatter');
  expect(output).toContain('export const toc');
  expect(output).not.toContain('?type=demo');
  expect(output).not.toContain('demoIndex');
});

test('production utoopack frontmatter still exports the demo index', () => {
  const output = emitFrontmatter.call(
    { resourcePath: '/docs/button.md' },
    {
      cwd: '/docs',
      locales: [],
      useUtoopackDemoHMR: false,
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        frontmatter: { title: 'Button' },
        toc: [],
        demos: [{ id: 'button-demo-basic' }],
      },
    } as any,
  );

  expect(output).toContain('export const demoIndex');
  expect(output).toContain('/docs/button.md?type=demo');
});

test('markdown loader reads md-loader cache', () => {
  const cache = {
    getSync: vi.fn(() => 'cached'),
  };

  expect(getMdLoaderCacheSync(cache, 'key', '')).toBe('cached');
  expect(cache.getSync).toHaveBeenCalledWith('key', '');
});

test('markdown demo runtime includes deferred previewer props', () => {
  const output = emitDemo.call(
    { resourcePath: '/docs/button.md' },
    {
      cwd: '/docs',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      useUtoopackDemoHMR: true,
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-basic',
            component: 'DemoComponent',
            asset: { id: 'button-demo-basic', dependencies: {} },
            resolveMap: {},
            previewerProps: { jsx: 'export default () => null;' },
            renderOpts: {},
          },
        ],
      },
    } as any,
  );

  expect(output).toContain(
    'previewerProps: {"jsx":"export default () => null;"}',
  );
});

test('utoopack emits one lightweight overlay for every demo in a markdown file', () => {
  const output = emitDemo.call(
    {
      resource: '/docs/button.md?type=demo&overlay=1',
      resourcePath: '/docs/button.md',
      resourceQuery: '?type=demo&overlay=1',
    },
    {
      cwd: '/docs',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      useUtoopackDemoHMR: true,
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-basic',
            component: 'BasicDemo',
            asset: {
              id: 'button-demo-basic',
              description: 'Basic asset',
              dependencies: {
                'basic.tsx': { type: 'FILE', value: 'source' },
              },
            },
            resolveMap: { 'basic.tsx': '/docs/basic.tsx' },
            previewerProps: { description: '<p>Basic</p>' },
            renderOpts: {},
            __dumiUtoopackHMRVersion: 'basic-v1',
            __dumiUtoopackDeferredPreviewerProps: [
              'jsx',
              'description',
              'style',
            ],
          },
          {
            id: 'button-demo-icon',
            component: 'IconDemo',
            asset: { id: 'button-demo-icon', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
            __dumiUtoopackHMRVersion: 'icon-v1',
            __dumiUtoopackDeferredPreviewerProps: [
              'jsx',
              'description',
              'style',
            ],
          },
        ],
      },
    } as any,
  );

  expect(output).toContain('"button-demo-basic"');
  expect(output).toContain('"button-demo-icon"');
  expect(output).toContain('"previewerProps":{"description":"<p>Basic</p>"}');
  expect(output).toContain('"asset":{"description":"Basic asset"}');
  expect(output).toContain(
    '"button-demo-icon":{"asset":{},"previewerProps":{},',
  );
  expect(output).toContain(
    '"__dumiOwnedPreviewerProps":["jsx","description","style"]',
  );
  expect(output).not.toContain('BasicDemo');
  expect(output).not.toContain("from '/docs/basic.tsx'");
  expect(output).not.toContain('require(');
  expect(output).toContain(
    'registerDemoHMRModule("/docs/button.md?type=demo&overlay=1", {"button-demo-basic":"basic-v1","button-demo-icon":"icon-v1"});',
  );
});

test('utoopack demo indexes share one overlay getter across every demo', () => {
  const output = renderDemoIndex(
    'C:\\repo\\docs\\button.md',
    {
      cwd: 'C:\\repo',
      locales: [],
      useUtoopackDemoHMR: true,
      __dumiLoaderContextPath: 'C:\\repo\\.dumi\\loader-context.cjs',
    } as any,
    [{ id: 'button-demo-basic' }, { id: 'button-demo-icon' }] as any,
  );

  expect(output).toContain('getters: demoGetters');
  expect(output).toContain('() => import("C:/repo/docs/button.md?type=demo")');
  expect(output).toContain(
    '() => import("C:/repo/docs/button.md?type=demo&overlay=1")',
  );
  expect(output.match(/\?type=demo&overlay=1/g)).toHaveLength(1);
  expect(output).not.toContain('&demo=');
  expect(output).toContain('mergeDemoModules');
  expect(output).toContain(
    'Promise.all([demoRuntimeGetter(), demoOverlayGetter()])',
  );
});

test('markdown demo runtime registers internal HMR versions without exposing them', () => {
  const output = emitDemo.call(
    {
      resource: 'C:\\repo\\docs\\button.md?type=demo&overlay=1',
      resourcePath: 'C:\\repo\\docs\\button.md',
      resourceQuery: '?type=demo&overlay=1',
    },
    {
      cwd: 'C:\\repo',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      useUtoopackDemoHMR: true,
      __dumiLoaderContextPath: 'C:\\repo\\.dumi\\loader-context.cjs',
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-basic',
            component: 'DemoComponent',
            asset: { id: 'button-demo-basic', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
            __dumiUtoopackHMRVersion: 'semantic-v1',
          },
        ],
      },
    } as any,
  );

  expect(output).toContain(
    "import { registerDemoHMRModule } from 'dumi/dist/client/theme-api/DumiDemo/hmr';",
  );
  expect(output).toContain(
    'registerDemoHMRModule("C:/repo/docs/button.md?type=demo&overlay=1", {"button-demo-basic":"semantic-v1"});',
  );
  expect(output).toContain("typeof __turbopack_context__ !== 'undefined'");
  expect(output).toContain(
    "typeof __turbopack_context__.m?.hot?.accept === 'function'",
  );
  expect(output).toContain('__turbopack_context__.m.hot.accept();');
  expect(output.indexOf('__turbopack_context__.m.hot.accept();')).toBeLessThan(
    output.indexOf('registerDemoHMRModule('),
  );
  expect(output).not.toContain('module.hot');
  expect(output).not.toContain('import.meta.turbopackHot');
  expect(output).not.toContain('__dumiUtoopackHMRVersion');
});

test('utoopack self-accepts a fully versioned runtime and notifies the overlay channel', () => {
  const output = emitDemo.call(
    {
      resource: '/docs/button.md?type=demo',
      resourcePath: '/docs/button.md',
      resourceQuery: '?type=demo',
    },
    {
      cwd: '/docs',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      useUtoopackDemoHMR: true,
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-basic',
            component: 'DemoComponent',
            asset: { id: 'button-demo-basic', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
            __dumiUtoopackHMRVersion: 'runtime-v1',
          },
        ],
      },
    } as any,
  );

  expect(output).toContain('__turbopack_context__.m.hot.accept();');
  expect(output).toContain(
    'registerDemoHMRModule("/docs/button.md?type=demo&overlay=1", {"button-demo-basic":"runtime-v1"}, "runtime");',
  );
});

test('markdown demo runtime ignores stale HMR metadata in production', () => {
  const output = emitDemo.call(
    {
      resource: '/docs/button.md?type=demo',
      resourcePath: '/docs/button.md',
      resourceQuery: '?type=demo',
    },
    {
      cwd: '/docs',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      useUtoopackDemoHMR: false,
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-basic',
            component: 'DemoComponent',
            asset: { id: 'button-demo-basic', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
            __dumiUtoopackHMRVersion: 'stale-dev-version',
          },
        ],
      },
    } as any,
  );

  expect(output).not.toContain('registerDemoHMRModule');
  expect(output).not.toContain('__turbopack_context__.m.hot.accept()');
});

test('legacy page-level demo modules never self-accept mixed demo updates', () => {
  const output = emitDemo.call(
    {
      resource: '/docs/button.md?type=demo',
      resourcePath: '/docs/button.md',
      resourceQuery: '?type=demo',
    },
    {
      cwd: '/docs',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      useUtoopackDemoHMR: true,
      __dumiLoaderContextPath: '/docs/.dumi/loader-context.cjs',
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-deferred',
            component: 'DeferredDemo',
            asset: { id: 'button-demo-deferred', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
            __dumiUtoopackHMRVersion: 'deferred-v1',
          },
          {
            id: 'button-demo-legacy',
            component: 'LegacyDemo',
            asset: { id: 'button-demo-legacy', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
          },
        ],
      },
    } as any,
  );

  expect(output).not.toContain('__turbopack_context__.m.hot.accept();');
});

test('markdown demo runtime stays byte-compatible without internal HMR versions', () => {
  const output = emitDemo.call(
    {
      resource: 'C:\\repo\\docs\\button.md?type=demo&locale=zh-CN',
      resourcePath: 'C:\\repo\\docs\\button.md',
      resourceQuery: '?type=demo&locale=zh-CN',
    },
    {
      cwd: 'C:\\repo',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      __dumiLoaderContextPath: 'C:\\repo\\.dumi\\loader-context.cjs',
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-basic',
            component: 'DemoComponent',
            asset: { id: 'button-demo-basic', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
          },
        ],
      },
    } as any,
  );

  expect(output).toBe(`import React from 'react';
import 'C:/repo/docs/button.md?watch=parent';
export const demos = {
  'button-demo-basic': {
    component: DemoComponent,
    asset: {
  "id": "button-demo-basic",
  "dependencies": {}
},
    context: {},
    renderOpts: undefined,
  },
};`);
});

test('markdown demo runtime does not self-accept outside utoopack', () => {
  const output = emitDemo.call(
    {
      resourcePath: '/docs/button.md',
      resourceQuery: '?type=demo',
    },
    {
      cwd: '/docs',
      locales: [],
      routes: {},
      disableLiveDemo: false,
      useUtoopackDemoHMR: true,
    } as any,
    {
      meta: {
        demos: [
          {
            id: 'button-demo-basic',
            component: 'DemoComponent',
            asset: { id: 'button-demo-basic', dependencies: {} },
            resolveMap: {},
            renderOpts: {},
            __dumiUtoopackHMRVersion: 'semantic-v1',
          },
        ],
      },
    } as any,
  );

  expect(output).toContain(
    'registerDemoHMRModule("/docs/button.md?type=demo", {"button-demo-basic":"semantic-v1"});',
  );
  expect(output).not.toContain('__turbopack_context__.m.hot.accept()');
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

test('markdown dependency hints survive content and runtime-only option changes', () => {
  const base = {
    resourcePath: '/docs/button.md',
    content: '# Button',
    useUtoopackDemoHMR: true,
    opts: {
      mode: 'demo',
      cacheEpoch: 'session-a',
      builtins: { Demo: { specifier: 'Demo', source: '/theme/Demo' } },
      onResolveDemos() {},
      onResolveAtomMeta() {},
      demoAssetsFile: '/tmp/demo-assets.jsonl',
      alias: { '@': '/src' },
    } as any,
  };
  const first = getMdTransformCacheKeys(base);
  const contentChanged = getMdTransformCacheKeys({
    ...base,
    content: '# Button\n\nUpdated',
  });
  const runtimeChanged = getMdTransformCacheKeys({
    ...base,
    opts: {
      ...base.opts,
      mode: 'frontmatter',
      cacheEpoch: 'session-b',
      demoAssetsFile: '/tmp/other-assets.jsonl',
    },
  });
  const transformOptionChanged = getMdTransformCacheKeys({
    ...base,
    opts: { ...base.opts, alias: { '@': '/other-src' } },
  });

  expect(contentChanged.depsHintKey).toBe(first.depsHintKey);
  expect(contentChanged.baseCacheKey).not.toBe(first.baseCacheKey);
  expect(runtimeChanged).toEqual(first);
  expect(transformOptionChanged.depsHintKey).not.toBe(first.depsHintKey);
  expect(transformOptionChanged.baseCacheKey).not.toBe(first.baseCacheKey);
});

test('the document overlay uses an isolated cache namespace', () => {
  const base = {
    resourcePath: '/docs/button.md',
    content: '# Button',
    useUtoopackDemoHMR: true,
    opts: {
      mode: 'demo',
      alias: { '@': '/src' },
    } as any,
  };
  const fullPage = getMdTransformCacheKeys(base);
  const overlay = getMdTransformCacheKeys({
    ...base,
    demoOverlay: true,
  });

  expect(overlay.depsHintKey).not.toBe(fullPage.depsHintKey);
  expect(overlay.baseCacheKey).not.toBe(fullPage.baseCacheKey);
});

test('markdown loader reuses a transform when demo dependencies are unchanged', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-cache-'));
  const demoFile = path.join(dir, 'basic.tsx');
  const result = { content: 'compiled', meta: {} } as any;

  fs.writeFileSync(demoFile, 'export default () => null;');

  try {
    const depsKey = await getDepsCacheKey([demoFile]);
    const cache = {
      getSync: vi.fn(() => ({
        version: 2,
        deps: [demoFile],
        depsKey,
        result,
      })),
    };

    expect(await getMdLoaderCacheResult(cache, 'cache-key')).toBe(result);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('markdown loader invalidates a transform when a demo dependency changes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-cache-'));
  const demoFile = path.join(dir, 'basic.tsx');
  const original = 'export default () => null;';

  fs.writeFileSync(demoFile, original);

  try {
    const depsKey = await getDepsCacheKey([demoFile]);
    const cache = {
      getSync: vi.fn(() => ({
        version: 2,
        deps: [demoFile],
        depsKey,
        result: { content: 'compiled', meta: {} },
      })),
    };

    fs.writeFileSync(demoFile, 'export default () => <button />;');

    expect(await getMdLoaderCacheResult(cache, 'cache-key')).toBeUndefined();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('markdown loader rethrows dependency filesystem errors', async () => {
  const cache = {
    getSync: vi.fn(() => ({
      version: 2,
      deps: ['/private/demo.tsx'],
      depsKey: '[]',
      result: { content: 'compiled', meta: {} },
    })),
  };
  const error = Object.assign(new Error('EACCES: permission denied'), {
    code: 'EACCES',
  });

  await expect(
    getMdLoaderCacheResult(cache, 'cache-key', async () => {
      throw error;
    }),
  ).rejects.toBe(error);
});

test('markdown loader ignores legacy transform cache records', async () => {
  const cache = {
    getSync: vi.fn(() => ({
      version: 1,
      deps: [],
      depsKey: '[]',
      result: { content: 'compiled', meta: {} },
    })),
  };

  expect(await getMdLoaderCacheResult(cache, 'cache-key')).toBeUndefined();
});

test('markdown loader invalidates a transform when a demo sidecar is added', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-cache-'));
  const sidecarFile = path.join(dir, 'basic.md');
  const result = { content: 'compiled', meta: {} } as any;

  try {
    const depsKey = await getDepsCacheKey([sidecarFile]);
    const cache = {
      getSync: vi.fn(() => ({
        version: 2,
        deps: [sidecarFile],
        depsKey,
        result,
      })),
    };

    expect(await getMdLoaderCacheResult(cache, 'cache-key')).toBe(result);

    fs.writeFileSync(sidecarFile, '## en-US\n\nNew description.');

    expect(await getMdLoaderCacheResult(cache, 'cache-key')).toBeUndefined();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('markdown cache retries when a dependency changes during transform', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-race-'));
  const dependencyFile = path.join(dir, 'demo.tsx');
  let transforms = 0;

  fs.writeFileSync(dependencyFile, 'before');

  try {
    const record = await createStableTransform({
      initialDeps: [dependencyFile],
      createValue: async () => {
        transforms += 1;
        const content = fs.readFileSync(dependencyFile, 'utf-8');

        if (transforms === 1) fs.writeFileSync(dependencyFile, 'after');

        return {
          content,
          meta: { demos: [], embeds: [dependencyFile] },
        } as any;
      },
      getDeps: (result) => result.meta.embeds,
    });

    expect(transforms).toBe(2);
    expect(record.result.content).toBe('after');
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test.each([
  { operation: 'created', initial: undefined, next: 'created' },
  { operation: 'deleted', initial: 'present', next: undefined },
])(
  'markdown cache retries when a dependency is $operation during transform',
  async ({ initial, next }) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-presence-'));
    const dependencyFile = path.join(dir, 'demo.md');
    let transforms = 0;

    if (initial) fs.writeFileSync(dependencyFile, initial);

    try {
      const record = await createStableTransform({
        initialDeps: [dependencyFile],
        createValue: async () => {
          transforms += 1;
          const content = fs.existsSync(dependencyFile)
            ? fs.readFileSync(dependencyFile, 'utf-8')
            : undefined;

          if (transforms === 1) {
            if (next) fs.writeFileSync(dependencyFile, next);
            else fs.rmSync(dependencyFile, { force: true });
          }

          return {
            content: content ?? '<missing>',
            meta: { demos: [], embeds: [dependencyFile] },
          } as any;
        },
        getDeps: (result) => result.meta.embeds,
      });

      expect(transforms).toBe(2);
      expect(record.result.content).toBe(next ?? '<missing>');
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  },
);

test('markdown cache discovers dependencies before publishing a cold transform', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-discovery-'));
  const dependencyFile = path.join(dir, 'demo.tsx');
  let transforms = 0;

  fs.writeFileSync(dependencyFile, 'stable');

  try {
    const record = await createStableTransform({
      createValue: async () => {
        transforms += 1;
        return {
          content: fs.readFileSync(dependencyFile, 'utf-8'),
          meta: { demos: [], embeds: [dependencyFile] },
        } as any;
      },
      getDeps: (result) => result.meta.embeds,
    });

    expect(transforms).toBe(2);
    expect(record.result.content).toBe('stable');
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('markdown cache does not publish continuously changing dependencies', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-unstable-'));
  const dependencyFile = path.join(dir, 'demo.tsx');
  let transforms = 0;

  fs.writeFileSync(dependencyFile, 'before');

  try {
    await expect(
      createStableTransform({
        initialDeps: [dependencyFile],
        maxAttempts: 2,
        createValue: async () => {
          transforms += 1;
          const content = fs.readFileSync(dependencyFile, 'utf-8');

          fs.writeFileSync(
            dependencyFile,
            content === 'before' ? 'after' : 'before',
          );

          return {
            content,
            meta: { demos: [], embeds: [dependencyFile] },
          } as any;
        },
        getDeps: (result) => result.meta.embeds,
      }),
    ).rejects.toMatchObject({ code: 'EDEPSUNSTABLE' });
    expect(transforms).toBe(2);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('markdown cache rejects an A-B-A dependency mutation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-aba-'));
  const dependencyFile = path.join(dir, 'demo.tsx');
  let transforms = 0;

  fs.writeFileSync(dependencyFile, 'before');

  try {
    const record = await createStableTransform({
      initialDeps: [dependencyFile],
      createValue: async () => {
        transforms += 1;

        if (transforms === 1) {
          fs.writeFileSync(dependencyFile, 'transient');
          const content = fs.readFileSync(dependencyFile, 'utf-8');

          fs.writeFileSync(dependencyFile, 'before');
          const later = new Date(Date.now() + 2000);
          fs.utimesSync(dependencyFile, later, later);

          return {
            content,
            meta: { demos: [], embeds: [dependencyFile] },
          } as any;
        }

        return {
          content: fs.readFileSync(dependencyFile, 'utf-8'),
          meta: { demos: [], embeds: [dependencyFile] },
        } as any;
      },
      getDeps: (result) => result.meta.embeds,
    });

    expect(transforms).toBe(2);
    expect(record.result.content).toBe('before');
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('markdown cache rejects a missing-created-missing dependency mutation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-missing-aba-'));
  const dependencyFile = path.join(dir, 'demo.md');
  let transforms = 0;

  try {
    const record = await createStableTransform({
      initialDeps: [dependencyFile],
      createValue: async () => {
        transforms += 1;

        if (transforms === 1) {
          fs.writeFileSync(dependencyFile, 'transient');
          const content = fs.readFileSync(dependencyFile, 'utf-8');

          fs.rmSync(dependencyFile);
          const later = new Date(Date.now() + 2000);
          fs.utimesSync(dir, later, later);

          return {
            content,
            meta: { demos: [], embeds: [dependencyFile] },
          } as any;
        }

        return {
          content: '<missing>',
          meta: { demos: [], embeds: [dependencyFile] },
        } as any;
      },
      getDeps: (result) => result.meta.embeds,
    });

    expect(transforms).toBe(2);
    expect(record.result.content).toBe('<missing>');
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack fingerprints do not create implicit demo watch edges', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-fingerprint-'));
  const dependencyFile = path.join(dir, 'demo.tsx');
  const trackedRead = vi.fn();
  const readDependency = createDependencyReader(
    {
      fs: {
        readFile: trackedRead,
      },
    },
    true,
    'demo',
  );

  fs.writeFileSync(dependencyFile, 'untracked');

  try {
    await expect(readDependency(dependencyFile)).resolves.toBe('untracked');
    expect(trackedRead).not.toHaveBeenCalled();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test.each([undefined, 'frontmatter', 'text', 'demo-index', 'demo'] as const)(
  'utoopack %s mode fingerprints demo dependencies without tracked reads',
  async (mode) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-untracked-'));
    const dependencyFile = path.join(dir, 'demo.tsx');
    const trackedRead = vi.fn(
      (_file: string, callback: (err: null, data: Buffer) => void) => {
        callback(null, Buffer.from('tracked'));
      },
    );
    const loaderContext = { fs: { readFile: trackedRead } };

    fs.writeFileSync(dependencyFile, 'untracked');

    try {
      await expect(
        createDependencyReader(loaderContext, true, mode)(dependencyFile),
      ).resolves.toBe('untracked');
      expect(trackedRead).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  },
);

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

test('utoopack scopes deferred sidecars to one lightweight document overlay', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-watch-plan-'));
  const basicFile = path.join(dir, 'basic.tsx');
  const basicSidecar = path.join(dir, 'basic.md');
  const iconFile = path.join(dir, 'icon.tsx');
  const iconSidecar = path.join(dir, 'icon.md');
  const demos = [
    {
      id: 'button-demo-basic',
      resolveMap: { 'index.tsx': basicFile },
      __dumiUtoopackDeferredSidecar: true,
    },
    {
      id: 'button-demo-icon',
      resolveMap: { 'index.tsx': iconFile },
    },
  ] as any;
  const baseOpts = {
    useUtoopackDemoHMR: true,
    __dumiLoaderContextPath: '/tmp/dumi-loader-context.cjs',
  } as any;

  fs.writeFileSync(basicFile, 'export default () => null;');
  fs.writeFileSync(basicSidecar, 'Basic description');
  fs.writeFileSync(iconFile, 'export default () => null;');
  fs.writeFileSync(iconSidecar, 'Icon description');

  try {
    expect(
      getDemoWatchFiles(
        { ...baseOpts, mode: 'demo' },
        demos,
        '?type=demo&overlay=1',
      ),
    ).toEqual([basicFile, basicSidecar, iconFile, iconSidecar]);
    expect(getDemoWatchFiles({ ...baseOpts, mode: 'demo' }, demos)).toEqual([
      basicFile,
      iconFile,
      iconSidecar,
    ]);
    expect(getDemoWatchFiles(baseOpts, demos)).toEqual([
      basicFile,
      iconFile,
      iconSidecar,
    ]);
    expect(
      getDemoWatchFiles({ ...baseOpts, mode: 'frontmatter' }, demos),
    ).toEqual([basicFile, iconFile, iconSidecar]);
    expect(
      getDemoWatchFiles({ ...baseOpts, mode: 'demo-index' }, demos),
    ).toEqual([]);

    const loaderContext = {
      addDependency: vi.fn(),
      addMissingDependency: vi.fn(),
    };
    addMdResultDependencies(
      loaderContext,
      { ...baseOpts, mode: 'demo' },
      { meta: { demos, embeds: [] } } as any,
      '?type=demo&overlay=1',
    );
    expect(loaderContext.addDependency.mock.calls).toEqual([
      [basicFile],
      [basicSidecar],
      [iconFile],
      [iconSidecar],
    ]);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack tracks missing demo sidecars as file dependencies', () => {
  const loaderContext = {
    addDependency: vi.fn(),
    addMissingDependency: vi.fn(),
  };
  const sidecarFile = path.join(
    os.tmpdir(),
    `dumi-missing-sidecar-${process.pid}.md`,
  );

  fs.rmSync(sidecarFile, { force: true });

  addDemoFileDependency(
    loaderContext,
    { __dumiLoaderContextPath: '/tmp/dumi-loader-ctx.cjs' } as any,
    sidecarFile,
  );

  expect(loaderContext.addDependency).toHaveBeenCalledWith(sidecarFile);
  expect(loaderContext.addMissingDependency).not.toHaveBeenCalled();
});

test('webpack tracks missing demo sidecars as missing dependencies', () => {
  const loaderContext = {
    addDependency: vi.fn(),
    addMissingDependency: vi.fn(),
  };
  const sidecarFile = path.join(
    os.tmpdir(),
    `dumi-missing-webpack-sidecar-${process.pid}.md`,
  );

  fs.rmSync(sidecarFile, { force: true });
  addDemoFileDependency(loaderContext, {} as any, sidecarFile);

  expect(loaderContext.addDependency).not.toHaveBeenCalled();
  expect(loaderContext.addMissingDependency).toHaveBeenCalledWith(sidecarFile);
});
