import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryHistory, MemoryHistory, Router } from '@umijs/runtime';
import Device from '../components/Device';
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
    meta: {},
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

  it('should render builtin components correctly', () => {
    const { getByText, getByTitle } = render(
      <Router history={history}>
        <Layout {...baseProps}>
          <>
            <Previewer
              title="demo-1"
              identifier="demo-1"
              sources={{
                _: {
                  jsx: "export default () => 'JavaScript'",
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
          </>
          <Device className="__dumi-default-mobile-content-device" url="/~demos/demo-123" />
        </Layout>
      </Router>,
    );

    expect(getByTitle('dumi-previewer').src).toEqual('http://localhost/~demos/demo-123');

    expect(getByText("'TypeScript'")).not.toBeNull();

    getByTitle('Toggle type for source code').click();

    expect(getByText("'JavaScript'")).not.toBeNull();

    expect(getByText("'Main'")).not.toBeNull();

    getByText('Other.jsx').click();

    expect(getByText("'Other'")).not.toBeNull();
  });
  it('should render demos layout', () => {
    const { getByText, getByTitle } = render(
      <Router history={history}>
        <DemoLayout {...baseProps}>
          <div title="content">123</div>
        </DemoLayout>
      </Router>,
    );

    expect(getByTitle('content')).not.toBeNull();
  });
});
