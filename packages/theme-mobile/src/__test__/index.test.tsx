import '@testing-library/jest-dom';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { context as Context } from 'dumi/theme';
import type { MemoryHistory} from '@umijs/runtime';
import { createMemoryHistory, Router } from '@umijs/runtime';

import Previewer from '../builtins/Previewer';
import Layout from '../layouts';
import DemoLayout from '../layouts/demo';

let history: MemoryHistory;

// mock history location which import from 'dumi'
jest.mock('dumi', () => ({
  history: { location: { pathname: '/' } },
}));

describe('mobile theme', () => {
  history = createMemoryHistory({ initialEntries: ['/', '/en-US'], initialIndex: 0 });
  const baseCtx = {
    title: 'test',
    locale: 'zh-CN',
    routes: [
      {
        path: '/',
        title: '首页',
        meta: {},
      },
      {
        path: '/en-US',
        title: 'Home',
        meta: {},
      },
    ],
    config: {
      locales: [
        { name: 'zh-CN', label: '中文' },
        { name: 'en-US', label: 'English' },
      ],
      menus: {},
      navs: {},
      title: 'test',
      logo: '/',
      mode: 'site' as 'doc' | 'site',
      repository: { branch: 'mater' },
    },
    meta: { title: 'demo' },
    menu: [
      {
        title: '分组',
        children: [
          {
            title: 'English',
            path: '/en',
          },
        ],
      },
    ],
    nav: [
      {
        path: '/',
        title: '首页',
        children: [],
      },
      {
        title: '生态',
        children: [
          {
            path: 'https://d.umijs.org',
            title: 'GitHub',
            children: [],
          },
        ],
      },
    ],
    base: '/',
  };
  const baseProps = {
    history,
    location: { ...history.location, query: {} },
    match: { params: {}, isExact: true, path: '/', url: '/' },
    route: { routes: baseCtx.routes },
  };
  const originalOffsetTop = Object.getOwnPropertyDescriptor(
    window.HTMLElement.prototype,
    'offsetTop',
  );
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    window.HTMLElement.prototype,
    'offsetHeight',
  );

  beforeAll(() => {
    Object.defineProperties(window.HTMLElement.prototype, {
      // mock offsetTop because jest not implement it
      // refer: https://github.com/jsdom/jsdom/issues/135
      offsetTop: {
        get() {
          return document.querySelector('.__dumi-default-mobile-previewer') === this ? 130 : 200;
        },
      },
      // mock second demo height
      offsetHeight: {
        get: () => 300,
      },
    });
  });

  afterAll(() => {
    Object.defineProperties(window.HTMLElement.prototype, {
      offsetTop: originalOffsetTop,
      offsetHeight: originalOffsetHeight,
    });
  });

  it('should render builtin components correctly', async () => {
    const { getByText, getByTitle } = render(
      <Router history={history}>
        <Layout {...baseProps}>
          <Context.Provider value={baseCtx}>
            <Previewer
              title="demo-1"
              identifier="demo-1"
              sources={{
                _: {
                  tsx: "export default () => 'TypeScript'",
                },
              }}
              dependencies={{}}
            >
              <>demo-1</>
            </Previewer>
            <Previewer
              title="demo-2"
              identifier="demo-2"
              demoUrl="http://localhost/~demos/demo-2-custom"
              sources={{
                _: {
                  jsx: "export default () => 'Main'",
                },
                'Other.jsx': {
                  import: './Other.jsx',
                  content: "export default () => 'Other'",
                },
              }}
              dependencies={{}}
            />
          </Context.Provider>
        </Layout>
      </Router>,
    );

    // wait for debounce
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // expect initialize to render the first demo
    expect((getByTitle('dumi-previewer') as HTMLIFrameElement).src).toEqual(
      'http://localhost/~demos/demo-1',
    );

    expect(getByText("'TypeScript'")).not.toBeNull();

    expect(getByText("'Main'")).not.toBeNull();

    getByText('Other.jsx').click();

    expect(getByText("'Other'")).not.toBeNull();

    // trigger demo refresh (only for coverage)
    (document.querySelector('[role=refresh]') as HTMLButtonElement).click();

    // trigger scroll
    await act(async () => {
      const secondDemo = document.querySelector(
        '.__dumi-default-mobile-previewer:nth-child(2)',
      ) as HTMLDivElement;

      window.dispatchEvent(new Event('scroll'));
      document.documentElement.scrollTop = secondDemo.offsetTop + 1;

      // wait for debounce
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // expect initialize to render the second demo
    await waitFor(() =>
      expect((getByTitle('dumi-previewer') as HTMLIFrameElement).src).toEqual(
        'http://localhost/~demos/demo-2-custom',
      ),
    );
  });

  it('should render demos layout', () => {
    const { getByTitle } = render(
      <Router history={history}>
        <DemoLayout {...baseProps}>
          <div title="content">123</div>
        </DemoLayout>
      </Router>,
    );

    expect(getByTitle('content')).not.toBeNull();
  });

  it('should render device with carrier', async () => {

    render(
      <Router history={history}>
        <Context.Provider value={{
          ...baseCtx,
          config: {
            ...baseCtx.config,
            theme: {
              carrier: 'test carrier'
            },
          },
        }}>
            <Layout {...baseProps}>
              <Previewer
                title="demo-1"
                identifier="demo-1"
                demoUrl="http://localhost/~demos/demo-1-custom"
                sources={{
                  _: {
                    tsx: "export default () => 'TypeScript'",
                  },
                }}
                dependencies={{}}
              >
                <>demo-1</>
              </Previewer>
            </Layout>
          </Context.Provider>
      </Router>,
    );

    // wait for debounce
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(document.querySelector('.__dumi-default-device-status-carrier').innerHTML).toEqual('test carrier')
  });

  it('should render without simulator', async () => {
    render(
      <Router history={history}>
        <Layout {...baseProps}>
          <Context.Provider value={baseCtx}>
            <Previewer
              title="a"
              identifier="a"
              sources={{
                _: {
                  tsx: "export default () => 'TypeScript'",
                },
              }}
              simulator={false}
              dependencies={{}}
            />
          </Context.Provider>
        </Layout>
      </Router>,
    );

    // wait for debounce
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(document.querySelector('.__dumi-default-device').textContent).toContain("I'm a!");
  });
});
