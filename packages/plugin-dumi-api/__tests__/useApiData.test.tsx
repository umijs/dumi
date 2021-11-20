import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import type { IThemeContext } from '@umijs/preset-dumi/lib/theme/context';
import Context from '@umijs/preset-dumi/lib/theme/context';
import useApiData from '../src/useApiData';

describe('theme API: useApiData', () => {
  const wrapper = ({ children }) => (
    <Context.Provider
      value={
        {
          locale: 'zh-CN',
          config: { locales: [{ name: 'zh-CN', label: '中文' }] },
        } as unknown as IThemeContext
      }
    >
      {children}
    </Context.Provider>
  );

  it('should get normal api data', async () => {
    const { result } = renderHook(() => useApiData('Normal'), { wrapper });

    expect(result.current).toEqual({ default: [{ identifier: 'normal', type: 'string' }] });
  });

  it('should get api data with locale description', async () => {
    const { result } = renderHook(() => useApiData('LocaleDescription'), { wrapper });

    expect(result.current).toEqual({
      default: [
        {
          identifier: 'locale',
          type: 'string',
          description: 'default description',
        },
      ],
    });
  });
});
