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

    // set color to dark
    act(() => {
      result.current[1]('dark');
    });

    // expect response color change
    expect(result.current[0]).toEqual('dark');

    // expect save to local storage
    expect(localStorage.getItem('dumi:prefers-color')).toEqual('dark');

    // trigger media change
    act(() => {
      matchMedia.useMediaQuery('(prefers-color-scheme: light)');
    });

    // expect not response media change if color mode not be auto
    expect(result.current[0]).toEqual('dark');
    expect(document.documentElement.getAttribute(attrName)).toEqual('dark');

    // set color to auto then trigger media change
    act(() => {
      result.current[1]('auto');
      matchMedia.useMediaQuery('(prefers-color-scheme: light)');
    });

    // expect real attribute color be light but color changer still be auto
    expect(result.current[0]).toEqual('auto');
    expect(document.documentElement.getAttribute(attrName)).toEqual('light');

    // expect local storage value be auto
    expect(localStorage.getItem('dumi:prefers-color')).toEqual('auto');

    // trigger media change to dark then set color to auto
    act(() => {
      matchMedia.useMediaQuery('(prefers-color-scheme: dark)');
      result.current[1]('auto');
    });

    // expect real attribute color be dark
    expect(document.documentElement.getAttribute(attrName)).toEqual('dark');
  });
});
