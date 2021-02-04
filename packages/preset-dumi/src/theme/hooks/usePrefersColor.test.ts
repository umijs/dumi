import MatchMediaMock from 'jest-matchmedia-mock';
import { act, renderHook } from '@testing-library/react-hooks';

describe('theme API: usePrefersColor', () => {
  let matchMedia: MatchMediaMock;
  let usePrefersColor: any;
  const attrName = 'data-prefers-color';
  const originalColor = document.documentElement.getAttribute(attrName);

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
    document.documentElement.setAttribute(attrName, 'light');
    usePrefersColor = require('./usePrefersColor').default;
  });

  afterAll(() => {
    document.documentElement.setAttribute(attrName, originalColor);
    matchMedia.clear();
  });

  it('should works both initial value & toggle action', () => {
    const { result } = renderHook(() => usePrefersColor());

    // expect to equal initial value from html tag
    expect(result.current[0]).toEqual('light');

    // change media query to dark
    act(() => {
      matchMedia.useMediaQuery('(prefers-color-scheme: dark)');
    });

    // expect response media query change
    expect(result.current[0]).toEqual('dark');

    // detect local storage value be empty
    expect(localStorage.getItem('dumi:prefers-color')).toBeNull();

    // toggle color manually
    act(() => {
      result.current[1]();
    });

    // expect color changed
    expect(result.current[0]).toEqual('light');

    // expect save to local storage if current color was not matched prefers-color-schema
    expect(localStorage.getItem('dumi:prefers-color')).toEqual('light');

    // trigger dark media query again
    act(() => {
      matchMedia.useMediaQuery('(prefers-color-scheme: dark)');
    });

    // expect color not be changed by media query if user toggle color manually
    expect(result.current[0]).toEqual('light');

    // toggle color manually
    act(() => {
      result.current[1]();
    });

    // detect local storage value be empty if current color matched prefers-color-schema
    expect(localStorage.getItem('dumi:prefers-color')).toBeNull();
  });
});
