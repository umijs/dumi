import { vi } from 'vitest';
import {
  getDemoHMRRevision,
  registerDemoHMRModule,
  resetDemoHMRStoreForTest,
  subscribeDemoHMR,
} from './hmr';

const BUTTON_MODULE = 'button-demos';

beforeEach(() => {
  resetDemoHMRStoreForTest();
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

test('notifies only the demo whose semantic version changed', () => {
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

  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-basic')).toBe(1);
  expect(getDemoHMRRevision(BUTTON_MODULE, 'button-icon')).toBe(0);
  expect(onBasicChange).toHaveBeenCalledTimes(1);
  expect(onIconChange).not.toHaveBeenCalled();
});

test('keeps versions after a route unsubscribes', () => {
  const onChange = vi.fn();

  registerDemoHMRModule('button-demos', {
    'button-basic': 'version-1',
  });
  const unsubscribe = subscribeDemoHMR(
    BUTTON_MODULE,
    'button-basic',
    onChange,
  );
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

  expect(
    reloadedHMR.getDemoHMRRevision(BUTTON_MODULE, 'button-basic'),
  ).toBe(1);
});

test('isolates revisions and listeners for locale modules sharing a demo id', () => {
  const onEnglishChange = vi.fn();
  const onChineseChange = vi.fn();

  subscribeDemoHMR('button.en-US.md?type=demo', 'button-basic', onEnglishChange);
  subscribeDemoHMR('button.zh-CN.md?type=demo', 'button-basic', onChineseChange);
  registerDemoHMRModule('button.en-US.md?type=demo', {
    'button-basic': 'version-1',
  });
  registerDemoHMRModule('button.zh-CN.md?type=demo', {
    'button-basic': 'version-1',
  });

  registerDemoHMRModule('button.en-US.md?type=demo', {
    'button-basic': 'version-2',
  });

  expect(onEnglishChange).toHaveBeenCalledTimes(1);
  expect(onChineseChange).not.toHaveBeenCalled();
  expect(
    getDemoHMRRevision('button.en-US.md?type=demo', 'button-basic'),
  ).toBe(1);
  expect(
    getDemoHMRRevision('button.zh-CN.md?type=demo', 'button-basic'),
  ).toBe(0);
});
