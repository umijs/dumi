import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

type DemoGetter = () => Promise<{ demos: Record<string, unknown> }>;

function loadExportsTemplate(
  filesMeta: Record<string, unknown>,
  demoIndexMap: Record<string, unknown> = {},
) {
  const filename = new URL('./exports.ts.tpl', import.meta.url);
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename.pathname,
  }).outputText;
  const module = { exports: {} as Record<string, any> };

  vm.runInNewContext(compiled, {
    exports: module.exports,
    module,
    require: (id: string) => {
      if (id === '.') return { filesMeta, tabsMeta: {} };
      if (id === './demoIndex') return { demoIndexMap };
      throw new Error(`Unexpected template dependency: ${id}`);
    },
  });

  return module.exports;
}

async function resolveSuspenseValue<T>(read: () => T) {
  let pending: Promise<unknown> | undefined;

  try {
    read();
  } catch (error) {
    pending = error as Promise<unknown>;
  }

  expect(pending).toBeDefined();
  expect(typeof pending!.then).toBe('function');
  await pending;
  return read();
}

test('uses a per-demo getter when one is available', async () => {
  const aggregateGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'aggregate' } },
  }));
  const scopedGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'scoped' } },
  }));
  const runtime = loadExportsTemplate({
    button: {
      demoIndex: {
        ids: ['basic'],
        getter: aggregateGetter,
        getters: { basic: scopedGetter },
      },
    },
  });

  await expect(
    resolveSuspenseValue(() => runtime.useDemo('basic')),
  ).resolves.toEqual({ id: 'scoped' });
  expect(scopedGetter).toHaveBeenCalledOnce();
  expect(aggregateGetter).not.toHaveBeenCalled();
});

test('uses a per-demo getter from a lazy route index', async () => {
  const aggregateGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'aggregate' } },
  }));
  const scopedGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'scoped' } },
  }));
  const runtime = loadExportsTemplate(
    {},
    {
      button: async () => ({
        ids: ['basic'],
        getter: aggregateGetter,
        getters: { basic: scopedGetter },
      }),
    },
  );

  await expect(
    resolveSuspenseValue(() =>
      runtime.useDemo('basic', undefined, undefined, 'button'),
    ),
  ).resolves.toEqual({ id: 'scoped' });
  expect(scopedGetter).toHaveBeenCalledOnce();
  expect(aggregateGetter).not.toHaveBeenCalled();
});

test('falls back to the aggregate getter for legacy indexes', async () => {
  const aggregateGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'aggregate' } },
  }));
  const runtime = loadExportsTemplate({
    button: {
      demoIndex: {
        ids: ['basic'],
        getter: aggregateGetter,
      },
    },
  });

  await expect(
    resolveSuspenseValue(() => runtime.useDemo('basic')),
  ).resolves.toEqual({ id: 'aggregate' });
  expect(aggregateGetter).toHaveBeenCalledOnce();
});

test('falls back to the aggregate getter from a lazy legacy index', async () => {
  const aggregateGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'aggregate' } },
  }));
  const runtime = loadExportsTemplate(
    {},
    {
      button: async () => ({
        ids: ['basic'],
        getter: aggregateGetter,
      }),
    },
  );

  await expect(
    resolveSuspenseValue(() =>
      runtime.useDemo('basic', undefined, undefined, 'button'),
    ),
  ).resolves.toEqual({ id: 'aggregate' });
  expect(aggregateGetter).toHaveBeenCalledOnce();
});

test('keeps the aggregate getter for loading all demos', async () => {
  const aggregateGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'aggregate' } },
  }));
  const scopedGetter = vi.fn<DemoGetter>(async () => ({
    demos: { basic: { id: 'scoped' } },
  }));
  const runtime = loadExportsTemplate({
    button: {
      demoIndex: {
        ids: ['basic'],
        getter: aggregateGetter,
        getters: { basic: scopedGetter },
      },
    },
  });

  await expect(runtime.getFullDemos()).resolves.toEqual({
    basic: { id: 'aggregate', routeId: 'button' },
  });
  expect(aggregateGetter).toHaveBeenCalledOnce();
  expect(scopedGetter).not.toHaveBeenCalled();
});
