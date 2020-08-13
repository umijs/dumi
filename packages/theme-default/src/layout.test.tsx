import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryHistory, Router } from 'dumi';
import { context as Context } from 'dumi/theme';
import SourceCode from './builtins/SourceCode';
import Alert from './builtins/Alert';
import Badge from './builtins/Badge';
import Layout from './layout';

describe('default theme', () => {
  const history = createMemoryHistory({ initialEntries: ['/', '/en'], initialIndex: 0 });
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
        path: '/en',
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

  it('should render site home page', () => {
    const wrapper = ({ children }) => (
      <Context.Provider
        value={{
          ...baseCtx,
          meta: {
            title: 'test',
            hero: {
              title: 'Hero',
              desc: 'Hero Description',
              actions: [{ text: '开始', link: '/' }],
            },
            features: [{ title: 'Feat', desc: 'Feature' }],
          },
        }}
      >
        {children}
      </Context.Provider>
    );
    const { getAllByText, getByText } = render(
      <Router history={history}>
        <Layout {...baseProps}>
          <h1>Home Page</h1>
        </Layout>
      </Router>,
      { wrapper },
    );

    // expect navbar be rendered
    expect(getAllByText('首页')).not.toBeNull();

    // expect content be rendered
    expect(getByText('Home Page')).not.toBeNull();

    // expect hero be rendered
    expect(getByText('Hero')).not.toBeNull();

    // expect features be rendered
    expect(getByText('Feature')).not.toBeNull();
  });

  it('should render documentation page', async () => {
    const wrapper = ({ children }) => (
      <Context.Provider
        value={{
          ...baseCtx,
          meta: {
            title: 'test',
            slugs: [{ value: 'Slug A', heading: 'a', depth: 2 }],
          },
        }}
      >
        {children}
      </Context.Provider>
    );
    const { getByText } = render(
      <Router history={history}>
        <Layout {...baseProps}>
          <h1>Doc</h1>
        </Layout>
      </Router>,
      { wrapper },
    );

    // expect slugs be rendered
    expect(getByText('Slug A')).not.toBeNull();
  });

  it('should render builtin components correctly', () => {
    const code = "console.log('Hello World!')";
    const wrapper = ({ children }) => (
      <Context.Provider
        value={{
          ...baseCtx,
          meta: {
            title: 'test',
            slugs: [{ value: 'Slug A', heading: 'a', depth: 2 }],
          },
        }}
      >
        {children}
      </Context.Provider>
    );
    const { getByText } = render(
      <Router history={history}>
        <Layout {...baseProps}>
          <>
            <SourceCode code={code} lang="javascript" />
            <Alert type="info">Alert</Alert>
            <Badge type="info">Badge</Badge>
          </>
        </Layout>
      </Router>,
      { wrapper },
    );

    // expect SourceCode highlight
    expect(getByText('console')).toHaveClass('token');

    // expect Alert be rendered
    expect(getByText('Alert')).toHaveAttribute('type', 'info');

    // expect Badge be rendered
    expect(getByText('Badge')).toHaveClass('__dumi-default-badge');
  });
});
