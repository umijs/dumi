// @vitest-environment jsdom
import * as React from 'react';
import { Fragment, createElement, type PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useLiveDemo } from './useLiveDemo';

const mocks = vi.hoisted(() => ({
  compile: vi.fn(async (source: string) => source),
  context: {} as Record<string, unknown>,
  asset: { dependencies: { 'example.tsx': { type: 'FILE' } } },
  setComponent: vi.fn(),
}));

vi.mock('dumi', () => ({
  useDemo: () => ({
    context: mocks.context,
    asset: mocks.asset,
    renderOpts: { compile: mocks.compile },
  }),
}));
vi.mock('./useRenderer', () => ({
  useRenderer: () => ({
    canvasRef: { current: null },
    setComponent: mocks.setComponent,
  }),
}));
vi.mock('./utils', () => ({
  getAgnosticComponentModule: vi.fn(),
}));
vi.mock('./DumiDemo/DemoErrorBoundary', () => ({
  default: ({ children }: PropsWithChildren) =>
    createElement(Fragment, null, children),
}));

describe('useLiveDemo message exchange', () => {
  const cleanups: (() => void)[] = [];
  let actDescriptor: PropertyDescriptor | undefined;
  let runtimeErrors: unknown[];
  const captureError = (event: ErrorEvent) => {
    runtimeErrors.push(event.error);
    event.preventDefault();
  };
  const source = {
    'example.tsx':
      'exports.default = function Demo() { return require("react").createElement("span", null, "updated inline demo"); };',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.compile.mockReset().mockImplementation(async (code) => code);
    mocks.context.react = React;
    mocks.setComponent.mockReset();
    runtimeErrors = [];
    actDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'IS_REACT_ACT_ENVIRONMENT',
    );
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  afterEach(() => {
    cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    vi.clearAllTimers();
    vi.useRealTimers();
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

  function mount(opts?: Parameters<typeof useLiveDemo>[1]) {
    let result: ReturnType<typeof useLiveDemo>;
    function Fixture() {
      result = useLiveDemo('example', opts);
      return createElement(Fragment, null, result.node);
    }
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => root.render(createElement(Fixture)));
    cleanups.push(() => {
      act(() => root.unmount());
      host.remove();
    });
    return {
      host,
      get result() {
        return result!;
      },
    };
  }

  function createIframe() {
    const container = document.createElement('div');
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);
    document.body.appendChild(container);
    const iframeWindow = iframe.contentWindow!;
    iframeWindow.addEventListener('error', captureError);
    const postMessage = vi
      .spyOn(iframeWindow, 'postMessage')
      .mockImplementation(() => {});
    cleanups.push(() => {
      iframeWindow.removeEventListener('error', captureError);
      container.remove();
    });
    return { container, iframeWindow, postMessage };
  }

  function receive(
    target: Window,
    data: unknown,
    origin = window.location.origin,
    sender: MessageEventSource | null = target,
  ) {
    target.dispatchEvent(
      new MessageEvent('message', { data, origin, source: sender }),
    );
  }

  function completion(err: unknown = null) {
    return { type: 'dumi.liveDemo.compileDone', value: { err } };
  }

  test('still compiles and renders an ordinary inline edit', async () => {
    const fixture = mount();
    await act(async () => {
      await fixture.result.setSource(source);
    });
    expect(mocks.compile).toHaveBeenCalledWith(source['example.tsx'], {
      filename: 'example-example.tsx',
    });
    expect(fixture.host.textContent).toBe('updated inline demo');
    expect(fixture.result.loading).toBe(false);
    expect(fixture.result.error).toBe(null);
  });

  test('preserves ordinary inline compiler error feedback', async () => {
    const error = new Error('test compile error');
    mocks.compile.mockRejectedValueOnce(error);
    const fixture = mount();
    await act(async () => {
      await fixture.result.setSource(source);
    });
    expect(fixture.result.error).toBe(error);
    expect(fixture.result.loading).toBe(false);
  });

  test('sends iframe updates with an explicit origin and accepts its completion', async () => {
    const frame = createIframe();
    const fixture = mount({
      iframe: true,
      containerRef: { current: frame.container },
    });
    let pending!: Promise<void>;
    act(() => {
      pending = fixture.result.setSource(source);
    });
    try {
      act(() => vi.advanceTimersByTime(499));
      expect(fixture.result.loading).toBe(true);
      expect(frame.postMessage).toHaveBeenCalledWith(
        { type: 'dumi.liveDemo.setSource', value: source },
        window.location.origin,
      );
    } finally {
      await act(async () => {
        receive(frame.iframeWindow, completion());
        await pending;
      });
    }
    expect(fixture.result.error).toBe(null);
    expect(fixture.result.loading).toBe(false);
  });

  test.each([
    new Error('test iframe compile error'),
    'a custom compiler throw value',
  ])('preserves iframe compiler feedback %j', async (error) => {
    const frame = createIframe();
    const fixture = mount({
      iframe: true,
      containerRef: { current: frame.container },
    });
    let pending!: Promise<void>;
    act(() => {
      pending = fixture.result.setSource(source);
    });
    await act(async () => {
      receive(frame.iframeWindow, completion(error));
      await pending;
    });
    expect(fixture.result.error).toBe(error);
    expect(fixture.result.loading).toBe(false);
    act(() => receive(frame.iframeWindow, completion('late response')));
    expect(fixture.result.error).toBe(error);
  });

  test.each<[string, unknown, string?, string?]>([
    ['a foreign origin', completion(), 'https://other.example.test', 'iframe'],
    ['an opaque origin', completion(), 'null', 'iframe'],
    ['the parent as source', completion(), undefined, 'parent'],
    ['a missing source', completion(), undefined, 'missing'],
    ['null data', null],
    ['undefined data', undefined],
    ['an array', []],
    ['a non-string type', { type: 1, value: { err: null } }],
    [
      'a suffixed type',
      { type: 'dumi.liveDemo.compileDone.extra', value: { err: null } },
    ],
    ['null value', { type: 'dumi.liveDemo.compileDone', value: null }],
    ['array value', { type: 'dumi.liveDemo.compileDone', value: [] }],
    ['a missing err field', { type: 'dumi.liveDemo.compileDone', value: {} }],
    [
      'an inherited err field',
      {
        type: 'dumi.liveDemo.compileDone',
        value: Object.create({ err: null }),
      },
    ],
  ])(
    'ignores %s, then accepts a valid completion',
    async (_name, data, origin, sender) => {
      const frame = createIframe();
      const fixture = mount({
        iframe: true,
        containerRef: { current: frame.container },
      });
      let settled = false;
      let pending!: Promise<void>;
      act(() => {
        pending = fixture.result.setSource(source);
        pending.then(() => {
          settled = true;
        });
      });
      try {
        await act(async () => {
          receive(
            frame.iframeWindow,
            data,
            origin ?? window.location.origin,
            sender === 'parent'
              ? window
              : sender === 'missing'
              ? null
              : frame.iframeWindow,
          );
        });
        expect(settled).toBe(false);
        expect(fixture.result.error).toBe(null);
        expect(runtimeErrors).toEqual([]);
      } finally {
        await act(async () => {
          receive(frame.iframeWindow, completion());
        });
      }
      expect(settled).toBe(true);
    },
  );

  test('does not let one iframe complete another iframe edit', async () => {
    const frameA = createIframe();
    const frameB = createIframe();
    const fixtureA = mount({
      iframe: true,
      containerRef: { current: frameA.container },
    });
    const fixtureB = mount({
      iframe: true,
      containerRef: { current: frameB.container },
    });
    let settledA = false;
    let settledB = false;
    let pendingA!: Promise<void>;
    let pendingB!: Promise<void>;
    act(() => {
      pendingA = fixtureA.result.setSource(source);
      pendingB = fixtureB.result.setSource(source);
      pendingA.then(() => {
        settledA = true;
      });
      pendingB.then(() => {
        settledB = true;
      });
    });
    try {
      await act(async () => {
        receive(
          frameB.iframeWindow,
          completion(),
          window.location.origin,
          frameA.iframeWindow,
        );
      });
      expect(settledA).toBe(false);
      expect(settledB).toBe(false);
    } finally {
      await act(async () => {
        receive(frameA.iframeWindow, completion());
        receive(frameB.iframeWindow, completion());
        await Promise.all([pendingA, pendingB]);
      });
    }
    expect(settledA).toBe(true);
    expect(settledB).toBe(true);
  });
});
