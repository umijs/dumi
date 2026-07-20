import { vi } from 'vitest';
import {
  getDemoHMRRevision,
  mergeDemoModules,
  registerDemoHMRModule,
  resetDemoHMRStoreForTest,
  subscribeDemoHMR,
} from './hmr';

test('mergeDemoModules overlays deferred props without mutating runtime data', () => {
  const runtime = {
    demos: {
      basic: {
        component: 'BasicDemo',
        asset: {
          id: 'basic',
          description: 'old asset',
          dependencies: { 'index.tsx': { type: 'FILE', value: 'source' } },
        },
        previewerProps: { title: 'Basic', description: 'old' },
      },
      icon: { component: 'IconDemo' },
    },
  } as any;
  const overlay = {
    demos: {
      basic: {
        asset: { description: 'new asset' },
        previewerProps: { description: 'new', style: '.demo {}' },
        __dumiOwnedPreviewerProps: ['description', 'style'],
      },
    },
  } as any;

  expect(mergeDemoModules(runtime, overlay)).toEqual({
    demos: {
      basic: {
        component: 'BasicDemo',
        asset: {
          id: 'basic',
          description: 'new asset',
          dependencies: { 'index.tsx': { type: 'FILE', value: 'source' } },
        },
        previewerProps: {
          title: 'Basic',
          description: 'new',
          style: '.demo {}',
        },
      },
      icon: { component: 'IconDemo' },
    },
  });
  expect(runtime.demos.basic.previewerProps.description).toBe('old');
  expect(runtime.demos.basic.asset.description).toBe('old asset');
});

test('mergeDemoModules removes deleted deferred previewer props', () => {
  const runtime = {
    demos: {
      basic: {
        component: 'BasicDemo',
        previewerProps: {
          title: 'Keep title',
          description: 'old description',
          style: '.old {}',
        },
      },
    },
  } as any;
  const overlay = {
    demos: {
      basic: {
        previewerProps: {},
        __dumiOwnedPreviewerProps: ['description', 'style'],
      },
    },
  } as any;

  expect(mergeDemoModules(runtime, overlay)).toEqual({
    demos: {
      basic: {
        component: 'BasicDemo',
        previewerProps: { title: 'Keep title' },
      },
    },
  });
  expect(runtime.demos.basic.previewerProps.description).toBe(
    'old description',
  );
});

test('mergeDemoModules removes stale overlay-owned asset metadata', () => {
  const runtime = {
    demos: {
      basic: {
        component: 'BasicDemo',
        asset: {
          id: 'basic',
          description: 'old description',
          keywords: ['old'],
          snapshot: 'old.png',
          title: 'Old title',
          dependencies: { 'index.tsx': { type: 'FILE', value: 'source' } },
        },
      },
    },
  } as any;
  const overlay = {
    demos: {
      basic: { asset: {} },
    },
  } as any;

  expect(mergeDemoModules(runtime, overlay)).toEqual({
    demos: {
      basic: {
        component: 'BasicDemo',
        asset: {
          id: 'basic',
          dependencies: { 'index.tsx': { type: 'FILE', value: 'source' } },
        },
      },
    },
  });
  expect(runtime.demos.basic.asset.title).toBe('Old title');
});

const BUTTON_MODULE = 'button-demos';

beforeEach(() => {
  vi.useRealTimers();
  resetDemoHMRStoreForTest();
});

afterEach(() => {
  vi.useRealTimers();
});

test('bumps a demo revision only after its semantic version changes', () => {
  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-1',
  });

  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(0);

  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-2',
  });

  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(1);
});

test('does not bump when a module registers the same versions again', () => {
  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-1',
  });
  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-1',
  });

  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(0);
});

test('tracks runtime and overlay semantic channels without an initial bump', () => {
  registerDemoHMRModule(BUTTON_MODULE, {
    'button-basic': 'overlay-v1',
  });
  registerDemoHMRModule(
    BUTTON_MODULE,
    { 'button-basic': 'runtime-v1' },
    'runtime',
  );

  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(0);

  registerDemoHMRModule(
    BUTTON_MODULE,
    { 'button-basic': 'runtime-v2' },
    'runtime',
  );
  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(1);

  registerDemoHMRModule(BUTTON_MODULE, {
    'button-basic': 'overlay-v2',
  });
  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(2);
});

test('notifies only the demo whose semantic version changed', async () => {
  const onBasicChange = vi.fn();
  const onIconChange = vi.fn();

  subscribeDemoHMR(BUTTON_MODULE, 'button-basic', onBasicChange);
  subscribeDemoHMR(BUTTON_MODULE, 'button-icon', onIconChange);
  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-1',
    'button-icon': 'version-1',
  });

  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-2',
    'button-icon': 'version-1',
  });
  await new Promise((resolve) => {
    setTimeout(resolve);
  });

  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(1);
  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-icon')).toBe(0);
  expect(onBasicChange).toHaveBeenCalledTimes(1);
  expect(onIconChange).not.toHaveBeenCalled();
});

test('does not notify a stale parent subscription during module registration', async () => {
  vi.useFakeTimers();
  const staleParentLoader = vi.fn();
  const currentParentLoader = vi.fn();

  registerDemoHMRModule(BUTTON_MODULE, {
    'button-basic': 'version-1',
  });
  const unsubscribe = subscribeDemoHMR(
    BUTTON_MODULE,
    'button-basic',
    staleParentLoader,
  );

  registerDemoHMRModule(BUTTON_MODULE, {
    'button-basic': 'version-2',
  });

  // A new ?type=demo module evaluates before React has disposed the old
  // Markdown parent. Calling its subscription here would make that parent
  // invoke a dynamic import which Turbopack has already deleted.
  expect(staleParentLoader).not.toHaveBeenCalled();

  unsubscribe();
  subscribeDemoHMR(BUTTON_MODULE, 'button-basic', currentParentLoader);
  await vi.runAllTimersAsync();

  expect(staleParentLoader).not.toHaveBeenCalled();
  expect(currentParentLoader).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

test('keeps versions after a route unsubscribes', () => {
  const onChange = vi.fn();

  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-1',
  });
  const unsubscribe = subscribeDemoHMR(BUTTON_MODULE, 'button-basic', onChange);
  unsubscribe();

  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-2',
  });

  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(1);
  expect(onChange).not.toHaveBeenCalled();
});

test('keeps the store on globalThis across module reloads', async () => {
  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-1',
  });

  vi.resetModules();
  const reloadedHMR = await import('./hmr');
  reloadedHMR.registerDemoHMRModule('button-demos', {
    'button-basic': 'version-2',
  });

  expect(reloadedHMR.getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(1);
});

test('isolates revisions and listeners for locale modules sharing a demo id', async () => {
  const onEnglishChange = vi.fn();
  const onChineseChange = vi.fn();

  subscribeDemoHMR(
    'button.en-US.md?type=demo',
    'button-basic',
    onEnglishChange,
  );
  subscribeDemoHMR(
    'button.zh-CN.md?type=demo',
    'button-basic',
    onChineseChange,
  );
  registerDemoHMRModule('button.en-US.md?type=demo', {
    'button-basic': 'version-1',
  });
  registerDemoHMRModule('button.zh-CN.md?type=demo', {
    'button-basic': 'version-1',
  });

  registerDemoHMRModule('button.en-US.md?type=demo', {
    'button-basic': 'version-2',
  });
  await new Promise((resolve) => {
    setTimeout(resolve);
  });

  expect(onEnglishChange).toHaveBeenCalledTimes(1);
  expect(onChineseChange).not.toHaveBeenCalled();
  expect(getDemoHMRRevision('button.en-US.md?type=demo', 'button-basic')).toBe(
    1,
  );
  expect(getDemoHMRRevision('button.zh-CN.md?type=demo', 'button-basic')).toBe(
    0,
  );
});
