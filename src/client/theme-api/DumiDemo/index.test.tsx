import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const effectCleanups: Array<() => void> = [];
  const setHMRState = vi.fn();

  return {
    effectCleanups,
    previewer: vi.fn(() => null),
    setHMRState,
    useDemo: vi.fn(() => ({
      component: () => null,
      asset: { id: 'button-demo-basic', dependencies: {} },
      routeId: 'components/button/index.en-US',
      previewerProps: { jsx: 'runtime source' },
    })),
    useEffect: vi.fn((effect: () => void | (() => void)) => {
      const cleanup = effect();
      if (cleanup) effectCleanups.push(cleanup);
    }),
    useState: vi.fn((initial: unknown | (() => unknown)) => [
      typeof initial === 'function' ? (initial as () => unknown)() : initial,
      setHMRState,
    ]),
  };
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useState: mocks.useState,
  };
});

vi.mock('dumi', () => ({
  useAppData: () => ({ basename: '/' }),
  useDemo: mocks.useDemo,
  useSiteData: () => ({ historyType: 'browser' }),
}));

vi.mock('dumi/theme/builtins/Previewer', () => ({
  default: mocks.previewer,
}));

vi.mock('dumi/theme/builtins/Container', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../useRenderer', () => ({
  useRenderer: () => ({ canvasRef: { current: null } }),
}));

import { areDumiDemoPropsEqual, DumiDemo } from '.';
import { registerDemoHMRModule, resetDemoHMRStoreForTest } from './hmr';

beforeEach(() => {
  mocks.effectCleanups.splice(0).forEach((cleanup) => cleanup());
  mocks.setHMRState.mockClear();
  mocks.useDemo.mockClear();
  mocks.previewer.mockClear();
  resetDemoHMRStoreForTest();
});

test('DumiDemo merges deferred runtime previewer props', () => {
  renderToStaticMarkup(
    <DumiDemo
      demo={{
        __dumiUtoopackHMR: 'button-demos',
        id: 'button-demo-basic',
      }}
      previewerProps={{ filename: 'demo.tsx' }}
    />,
  );

  expect(mocks.previewer).toHaveBeenCalledWith(
    expect.objectContaining({
      demoUrl: expect.stringContaining('dumi-hmr=button-demos'),
      filename: 'demo.tsx',
      jsx: 'runtime source',
    }),
    undefined,
  );
  const demoUrl = mocks.previewer.mock.lastCall?.[0].demoUrl;
  expect(
    new URL(`${demoUrl}?theme=dark`, 'http://dumi.test').searchParams.get(
      'dumi-hmr',
    ),
  ).toBe('button-demos');
});

test('DumiDemo ignores runtime previewer props without the HMR opt-in', () => {
  renderToStaticMarkup(
    <DumiDemo
      demo={{ id: 'button-demo-basic' }}
      previewerProps={{ filename: 'demo.tsx' }}
    />,
  );

  expect(mocks.previewer).toHaveBeenCalledWith(
    expect.objectContaining({ filename: 'demo.tsx' }),
    undefined,
  );
  expect(mocks.previewer.mock.lastCall?.[0]).not.toHaveProperty('jsx');
});

test('DumiDemo rerenders for equal-length prop changes', () => {
  const previous = {
    demo: { id: 'button-demo-basic' },
    previewerProps: { title: 'A' },
  };
  const next = {
    demo: { id: 'button-demo-basic' },
    previewerProps: { title: 'B' },
  };

  expect(JSON.stringify(previous)).toHaveLength(JSON.stringify(next).length);
  expect(areDumiDemoPropsEqual(previous, next)).toBe(false);
});

test('DumiDemo adopts a replacement loader from a refreshed Markdown parent', () => {
  const previous = {
    demo: { id: 'button-demo-basic', loader: vi.fn() },
    previewerProps: { title: 'Basic' },
  };
  const next = {
    demo: { id: 'button-demo-basic', loader: vi.fn() },
    previewerProps: { title: 'Basic' },
  };

  expect(JSON.stringify(previous)).toBe(JSON.stringify(next));
  expect(areDumiDemoPropsEqual(previous, next)).toBe(false);
});

test('DumiDemo uses the persisted HMR revision in the demo cache version', () => {
  registerDemoHMRModule('button-demos', {
    'button-demo-basic': 'runtime-version-1',
  });
  registerDemoHMRModule('button-demos', {
    'button-demo-basic': 'runtime-version-2',
  });

  renderToStaticMarkup(
    <DumiDemo
      demo={{
        id: 'button-demo-basic',
        __dumiUtoopackHMR: 'button-demos',
        version: 'metadata-version',
      }}
      previewerProps={{ filename: 'demo.tsx' }}
    />,
  );

  expect(mocks.useDemo).toHaveBeenCalledWith(
    'button-demo-basic',
    undefined,
    JSON.stringify(['button-demos', 'metadata-version', 1]),
  );
});

test('DumiDemo isolates cache versions for identical ids in different modules', () => {
  const renderDemo = (hmrModuleId: string) =>
    renderToStaticMarkup(
      <DumiDemo
        demo={{
          id: 'button-demo-basic',
          __dumiUtoopackHMR: hmrModuleId,
          version: 'metadata-version',
        }}
        previewerProps={{ filename: 'demo.tsx' }}
      />,
    );

  renderDemo('button.zh-CN.md?type=demo&demo=button-demo-basic');
  renderDemo('button.en-US.md?type=demo&demo=button-demo-basic');

  expect(mocks.useDemo.mock.calls[0][2]).not.toBe(
    mocks.useDemo.mock.calls[1][2],
  );
});

test('DumiDemo keeps the original cache version when HMR is not enabled', () => {
  registerDemoHMRModule('button-demos', {
    'button-demo-basic': 'runtime-version-1',
  });
  registerDemoHMRModule('button-demos', {
    'button-demo-basic': 'runtime-version-2',
  });

  renderToStaticMarkup(
    <DumiDemo
      demo={{ id: 'button-demo-basic', version: 'metadata-version' }}
      previewerProps={{ filename: 'demo.tsx' }}
    />,
  );

  expect(mocks.useDemo).toHaveBeenCalledWith(
    'button-demo-basic',
    undefined,
    'metadata-version',
  );
});

test('DumiDemo subscribes to semantic version changes for HMR demos', async () => {
  renderToStaticMarkup(
    <DumiDemo
      demo={{
        id: 'button-demo-basic',
        __dumiUtoopackHMR: 'button-demos',
        version: 'metadata-version',
      }}
      previewerProps={{ filename: 'demo.tsx' }}
    />,
  );

  expect(mocks.setHMRState).toHaveBeenCalledTimes(1);

  registerDemoHMRModule('button-demos', {
    'button-demo-basic': 'runtime-version-1',
  });
  registerDemoHMRModule('button-demos', {
    'button-demo-basic': 'runtime-version-2',
  });
  await new Promise((resolve) => {
    setTimeout(resolve);
  });

  expect(mocks.setHMRState).toHaveBeenCalledTimes(2);
  const updateState = mocks.setHMRState.mock.lastCall![0];
  expect(
    updateState({
      id: 'button-demo-basic',
      moduleId: 'button-demos',
      revision: 0,
    }),
  ).toEqual({
    id: 'button-demo-basic',
    moduleId: 'button-demos',
    revision: 1,
  });
});
