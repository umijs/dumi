import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const effectCleanups: Array<() => void> = [];

  return {
    effectCleanups,
    search: '?routeId=components-button&dumi-hmr=button-demos',
    setHMRState: vi.fn(),
    useDemo: vi.fn(() => ({
      component: () => null,
      renderOpts: {},
    })),
    useEffect: vi.fn((effect: () => void | (() => void)) => {
      const cleanup = effect();
      if (cleanup) effectCleanups.push(cleanup);
    }),
    useState: vi.fn((initial: unknown | (() => unknown)) => [
      typeof initial === 'function' ? (initial as () => unknown)() : initial,
      mocks.setHMRState,
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
  useDemo: mocks.useDemo,
  useLiveDemo: () => ({
    error: undefined,
    loading: false,
    node: undefined,
    setSource: vi.fn(),
  }),
  useLocation: () => ({ search: mocks.search }),
  useParams: () => ({ id: 'button-basic' }),
}));

vi.mock('../../theme-api/useRenderer', () => ({
  useRenderer: () => ({ canvasRef: { current: null } }),
}));

import DemoRenderPage from '.';
import {
  registerDemoHMRModule,
  resetDemoHMRStoreForTest,
} from '../../theme-api/DumiDemo/hmr';

beforeEach(() => {
  mocks.setHMRState.mockClear();
  mocks.useDemo.mockClear();
  resetDemoHMRStoreForTest();
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    postMessage: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

afterEach(() => {
  mocks.effectCleanups.splice(0).forEach((cleanup) => cleanup());
  vi.unstubAllGlobals();
});

test('uses the persisted HMR revision and route id in the demo cache version', () => {
  registerDemoHMRModule('button-demos', {
    'button-basic': 'runtime-version-1',
  });
  registerDemoHMRModule('button-demos', {
    'button-basic': 'runtime-version-2',
  });

  renderToStaticMarkup(<DemoRenderPage />);

  expect(mocks.useDemo).toHaveBeenCalledWith(
    'button-basic',
    undefined,
    'dumi-hmr:1:route=components-button',
    'components-button',
  );
});

test('subscribes the iframe page to demo semantic version changes', () => {
  renderToStaticMarkup(<DemoRenderPage />);

  registerDemoHMRModule('button-demos', {
    'button-basic': 'runtime-version-1',
  });
  registerDemoHMRModule('button-demos', {
    'button-basic': 'runtime-version-2',
  });

  expect(mocks.setHMRState).toHaveBeenCalledTimes(1);
  const updateState = mocks.setHMRState.mock.lastCall![0];
  expect(
    updateState({
      id: 'button-basic',
      moduleId: 'button-demos',
      revision: 0,
    }),
  ).toEqual({
    id: 'button-basic',
    moduleId: 'button-demos',
    revision: 1,
  });
});

test('keeps the route cache behavior for demos without an HMR revision', () => {
  renderToStaticMarkup(<DemoRenderPage />);

  expect(mocks.useDemo).toHaveBeenCalledWith(
    'button-basic',
    undefined,
    undefined,
    'components-button',
  );
  expect(mocks.setHMRState).not.toHaveBeenCalled();
});

test('does not change the cache version when a demo module first registers', () => {
  registerDemoHMRModule('button-demos', {
    'button-basic': 'runtime-version-1',
  });

  renderToStaticMarkup(<DemoRenderPage />);

  expect(mocks.useDemo).toHaveBeenCalledWith(
    'button-basic',
    undefined,
    undefined,
    'components-button',
  );
  expect(mocks.setHMRState).not.toHaveBeenCalled();
});

test('uses a revision that changed while the iframe page was unmounted', () => {
  registerDemoHMRModule('button-demos', {
    'button-basic': 'runtime-version-1',
  });
  renderToStaticMarkup(<DemoRenderPage />);

  mocks.effectCleanups.splice(0).forEach((cleanup) => cleanup());
  mocks.setHMRState.mockClear();
  mocks.useDemo.mockClear();

  registerDemoHMRModule('button-demos', {
    'button-basic': 'runtime-version-2',
  });

  expect(mocks.setHMRState).not.toHaveBeenCalled();

  renderToStaticMarkup(<DemoRenderPage />);

  expect(mocks.useDemo).toHaveBeenCalledWith(
    'button-basic',
    undefined,
    'dumi-hmr:1:route=components-button',
    'components-button',
  );
});
