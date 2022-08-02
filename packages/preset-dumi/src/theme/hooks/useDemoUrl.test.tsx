import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import type { IThemeContext } from '../context';
import Context from '../context';
import useDemoUrl from './useDemoUrl';

describe('theme API: useDemoUrl', () => {
  const saved = window.location;
  delete window.location;
  window.location = {
    ...saved,
    href: `http://localhost/`,
  } as Window['location'];

  const baseCtx: IThemeContext = {
    locale: 'zh-CN',
    routes: [],
    config: {
      locales: [{ name: 'zh-CN', label: '中文' }],
      menus: {},
      navs: {},
      title: 'test',
      mode: 'doc',
      repository: { branch: 'master' },
      exportStatic: {
        htmlSuffix: true,
      },
      theme: {},
    },
    meta: { title: '' },
    menu: [],
    nav: [],
    base: '/',
  };

  beforeEach(() => {
    window.location.href = `http://localhost/`;
  });

  it('should return normal demo url', () => {
    const { result } = renderHook(() => useDemoUrl('test'));

    expect(result.current).toEqual('http://localhost/~demos/test');

    window.location.href += '#/';
    const { result: hashResult } = renderHook(() => useDemoUrl('test'));
    expect(hashResult.current).toEqual(`http://localhost/#/~demos/test`);
  });

  it('should return demo url and prefix router base', () => {
    // @ts-ignore
    window.routerBase = '/hello/';

    const { result } = renderHook(() => useDemoUrl('test'));

    expect(result.current).toEqual('http://localhost/hello/~demos/test');

    window.location.href += '#/';
    const { result: hashResult } = renderHook(() => useDemoUrl('test'));
    expect(hashResult.current).toEqual(`http://localhost/#/hello/~demos/test`);

    window.location.href = `http://localhost/#/123#anchor`;
    const { result: hashResult0 } = renderHook(() => useDemoUrl('test'));
    expect(hashResult0.current).toEqual(`http://localhost/#/hello/~demos/test`);

    window.location.href = `http://localhost/prefix/path/#/123#anchor`;
    const { result: hashResult1 } = renderHook(() => useDemoUrl('test'));
    expect(hashResult1.current).toEqual(`http://localhost/prefix/path/#/hello/~demos/test`);

    // @ts-ignore
    delete window.routerBase;
  });

  it('should return demo url with html suffix', () => {
    const wrapper = ({ children }) => (
      <Context.Provider value={baseCtx}>{children}</Context.Provider>
    );

    const { result } = renderHook(() => useDemoUrl('test'), { wrapper });

    expect(result.current).toEqual('http://localhost/~demos/test.html');

    window.location.href += '#/';
    const { result: hashResult } = renderHook(() => useDemoUrl('test'), { wrapper });
    expect(hashResult.current).toEqual(`http://localhost/#/~demos/test.html`);
  });
});
