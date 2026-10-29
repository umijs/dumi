// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import DemoRenderPage from '.';

const mocks = vi.hoisted(() => {
  const setSource = vi.fn();
  const demo: {
    component: () => ReactNode;
    asset: { dependencies: Record<string, { type: string }> } | null;
  } = {
    component: () => null,
    asset: {
      dependencies: {
        react: { type: 'NPM' },
        'example.tsx': { type: 'FILE' },
        'helper.ts': { type: 'FILE' },
      },
    },
  };
  return {
    setSource,
    demo,
    live: { node: null as unknown, setSource, error: null, loading: false },
  };
});

vi.mock('dumi', () => ({
  useParams: () => ({ id: 'example' }),
  useLocation: () => ({ search: '' }),
  useDemo: () => mocks.demo,
  useLiveDemo: () => mocks.live,
}));
vi.mock('../../theme-api/useRenderer', () => ({
  useRenderer: () => ({ canvasRef: { current: null } }),
}));

describe('Demo live editing message boundary', () => {
  const defaultAsset = mocks.demo.asset;
  const defaultComponent = mocks.demo.component;
  let root: Root;
  let host: HTMLDivElement;
  let parentFrame: HTMLIFrameElement;
  let siblingFrame: HTMLIFrameElement;
  let parentDescriptor: PropertyDescriptor | undefined;
  let actDescriptor: PropertyDescriptor | undefined;
  let runtimeErrors: unknown[];
  const source = { 'example.tsx': 'ordinary test source; never evaluated' };
  const captureError = (event: ErrorEvent) => {
    runtimeErrors.push(event.error);
    event.preventDefault();
  };

  beforeEach(() => {
    mocks.setSource.mockReset();
    mocks.live.node = null;
    mocks.live.error = null;
    mocks.live.loading = false;
    mocks.demo.asset = defaultAsset;
    mocks.demo.component = defaultComponent;
    runtimeErrors = [];
    actDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'IS_REACT_ACT_ENVIRONMENT',
    );
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent');
    parentFrame = document.createElement('iframe');
    siblingFrame = document.createElement('iframe');
    document.body.append(parentFrame, siblingFrame);
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parentFrame.contentWindow,
    });
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    window.addEventListener('error', captureError);
    vi.spyOn(window, 'postMessage').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => root.unmount());
    window.removeEventListener('error', captureError);
    host.remove();
    parentFrame.remove();
    siblingFrame.remove();
    if (parentDescriptor) {
      Object.defineProperty(window, 'parent', parentDescriptor);
    }
    if (actDescriptor) {
      Object.defineProperty(
        globalThis,
        'IS_REACT_ACT_ENVIRONMENT',
        actDescriptor,
      );
    } else {
      Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
    }
    vi.restoreAllMocks();
  });

  function mount() {
    act(() => root.render(createElement(DemoRenderPage)));
  }

  function send(
    data: unknown,
    origin = window.location.origin,
    sender: MessageEventSource | null = window.parent,
  ) {
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { data, origin, source: sender }),
      );
    });
  }

  test('accepts the same-origin parent and only requires the actual entry file', () => {
    mount();
    send({ type: 'dumi.liveDemo.setSource', value: source });
    expect(mocks.setSource).toHaveBeenCalledTimes(1);
    expect(mocks.setSource).toHaveBeenCalledWith(source);
    expect(runtimeErrors).toEqual([]);
  });

  test('preserves same-origin self updates on a standalone demo page', () => {
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: window,
    });
    mount();
    send({ type: 'dumi.liveDemo.setSource', value: source });
    expect(mocks.setSource).toHaveBeenCalledWith(source);
  });

  test('still displays a demo without asset metadata and declines live updates', () => {
    mocks.demo.asset = null;
    mocks.demo.component = () => createElement('span', null, 'static demo');
    mount();
    expect(host.textContent).toBe('static demo');
    send({ type: 'dumi.liveDemo.setSource', value: source });
    expect(mocks.setSource).not.toHaveBeenCalled();
    expect(runtimeErrors).toEqual([]);
  });

  test.each(['https://other.example.test', 'null', ''])(
    'rejects an untrusted origin %j even with the expected parent source',
    (origin) => {
      mount();
      send({ type: 'dumi.liveDemo.setSource', value: source }, origin);
      expect(mocks.setSource).not.toHaveBeenCalled();
      expect(runtimeErrors).toEqual([]);
    },
  );

  test.each(['sibling', 'self', 'missing'])(
    'rejects a same-origin %s source instead of the parent',
    (sender) => {
      mount();
      send(
        { type: 'dumi.liveDemo.setSource', value: source },
        window.location.origin,
        sender === 'sibling'
          ? siblingFrame.contentWindow
          : sender === 'self'
          ? window
          : null,
      );
      expect(mocks.setSource).not.toHaveBeenCalled();
      expect(runtimeErrors).toEqual([]);
    },
  );

  test.each<[string, unknown]>([
    ['null data', null],
    ['undefined data', undefined],
    ['string data', 'dumi.liveDemo.setSource'],
    ['array data', []],
    ['missing type', { value: source }],
    ['non-string type', { type: 1, value: source }],
    [
      'a suffixed type',
      { type: 'dumi.liveDemo.setSource.extra', value: source },
    ],
    ['null value', { type: 'dumi.liveDemo.setSource', value: null }],
    ['array value', { type: 'dumi.liveDemo.setSource', value: [] }],
    [
      'missing entry',
      { type: 'dumi.liveDemo.setSource', value: { 'helper.ts': '' } },
    ],
    [
      'non-string entry',
      { type: 'dumi.liveDemo.setSource', value: { 'example.tsx': 1 } },
    ],
    [
      'non-string extra file',
      {
        type: 'dumi.liveDemo.setSource',
        value: { ...source, 'helper.ts': {} },
      },
    ],
    [
      'inherited entry',
      { type: 'dumi.liveDemo.setSource', value: Object.create(source) },
    ],
  ])('rejects %s without invoking compilation or throwing', (_name, data) => {
    mount();
    send(data);
    expect(mocks.setSource).not.toHaveBeenCalled();
    expect(runtimeErrors).toEqual([]);
  });

  test('sends compile completion only to the explicit same origin', () => {
    mocks.live.node = createElement('span', null, 'updated');
    mount();
    expect(window.postMessage).toHaveBeenCalledWith(
      { type: 'dumi.liveDemo.compileDone', value: { err: null } },
      window.location.origin,
    );
  });

  test('removes the receiver when the demo page unmounts', () => {
    mount();
    act(() => root.unmount());
    root = createRoot(host);
    send({ type: 'dumi.liveDemo.setSource', value: source });
    expect(mocks.setSource).not.toHaveBeenCalled();
  });
});
