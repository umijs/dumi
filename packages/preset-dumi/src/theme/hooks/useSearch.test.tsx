import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import type { IThemeContext } from '../context';
import Context from '../context';
import useSearch from './useSearch';

describe('theme API: useSearch', () => {
  const baseCtx: IThemeContext = {
    locale: 'zh-CN',
    routes: [
      {
        path: '/a',
        title: 'A',
        meta: {
          locale: 'zh-CN',
          slugs: [{ value: 'B', heading: 'b' }],
          group: { title: 'A', path: '/a' },
        },
      },
      {
        path: '/en/a',
        title: 'A',
        meta: {
          locale: 'en-US',
          slugs: [{ value: 'B', heading: 'b' }],
          group: { title: 'A', path: '/en/a' },
        },
      },
    ],
    config: {
      locales: [{ name: 'zh-CN', label: '中文' }],
      menus: {},
      navs: {},
      title: 'test',
      mode: 'doc',
      repository: { branch: 'master' },
    },
    meta: { title: '' },
    menu: [],
    nav: [],
    base: '/',
  };

  it('should return Algolia binder', () => {
    const wrapper = ({ children }) => (
      <Context.Provider
        value={{
          ...baseCtx,
          config: { ...baseCtx.config, algolia: { apiKey: '', indexName: '' } },
        }}
      >
        {children}
      </Context.Provider>
    );
    const { result } = renderHook(() => useSearch(), { wrapper });

    // expect a Algolia binder
    expect(typeof result.current).toEqual('function');
  });

  it('should return result via builtin search', () => {
    const wrapper = ({ children }) => (
      <Context.Provider value={baseCtx}>{children}</Context.Provider>
    );
    const { result: emptyResult } = renderHook(() => useSearch(), { wrapper });
    const { result: localeResult } = renderHook(() => useSearch('B'), { wrapper });

    // empty result if no keywords
    expect(emptyResult.current).toEqual([]);

    // only return result which matched locale
    expect(localeResult.current).toHaveLength(1);
  });
});
