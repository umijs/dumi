import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import type { IThemeContext } from '../context';
import Context from '../context';
import useApiData from './useApiData';

describe('theme API: useApiData', () => {
  const wrapper = ({ children }) => (
    <Context.Provider
      value={
        {
          locale: 'zh-CN',
          config: { locales: [{ name: 'zh-CN', label: '中文' }] },
          apis: {
            Normal: {
              default: [
                {
                  identifier: 'normal',
                  type: 'string',
                },
              ],
            },
            LocaleDescription: {
              default: [
                {
                  identifier: 'locale',
                  type: 'string',
                  description: 'default description',
                  'description.en-US': 'english description',
                },
              ],
            },
            MultipleExports: {
              default: [],
              Other: [
                {
                  identifier: 'other',
                  type: 'string',
                },
                {
                  identifier: 'another',
                  type: 'string',
                  required: true,
                },
                {
                  identifier: 'anotherAgain',
                  type: 'string',
                  default: 'again',
                },
              ],
            },
          },
        } as unknown as IThemeContext
      }
    >
      {children}
    </Context.Provider>
  );

  // Test different locale status
  const localeWrapper = ({ children }) => (
    <Context.Provider
      value={
        {
          locale: 'en-US',
          config: {
            locales: [
              { name: 'zh-CN', label: '中文' },
              { name: 'en-US', label: 'English' },
            ],
          },
          apis: {
            MissLocaleDescription: {
              default: [
                {
                  identifier: 'other',
                  type: 'string',
                  description: 'default description',
                  'description.en-US': 'english description',
                },
                {
                  identifier: 'another',
                  type: 'string',
                  description: 'default description',
                },
              ],
            },
          },
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

  it('should get api data with defalt description cover miss locale', async () => {
    const { result } = renderHook(() => useApiData('MissLocaleDescription'), {
      wrapper: localeWrapper,
    });

    expect(result.current).toEqual({
      default: [
        {
          identifier: 'other',
          type: 'string',
          description: 'english description',
          'description.en-US': 'english description',
        },
        {
          identifier: 'another',
          type: 'string',
          description: 'default description',
        },
      ],
    });
  });
});
