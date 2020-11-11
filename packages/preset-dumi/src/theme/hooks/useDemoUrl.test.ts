import { renderHook } from '@testing-library/react-hooks';
import useDemoUrl from './useDemoUrl';

describe('theme API: useDemoUrl', () => {
  it('should return normal demo url', () => {
    const { result } = renderHook(() => useDemoUrl('test'));

    expect(result.current).toEqual('http://localhost/~demos/test');
  });

  it('should return demo url and prefix router base', () => {
    // @ts-ignore
    window.routerBase = '/hello/';

    const { result } = renderHook(() => useDemoUrl('test'));

    // @ts-ignore
    delete window.routerBase;

    expect(result.current).toEqual('http://localhost/hello/~demos/test');
  });

  it('should return basement-compatible demo url', () => {
    const oType = process.env.PLATFORM_TYPE;

    process.env.PLATFORM_TYPE = 'BASEMENT';
    const { result } = renderHook(() => useDemoUrl('test'));
    process.env.PLATFORM_TYPE = oType;

    expect(result.current).toEqual('http://localhost/_demos/test/index.html');
  });
});
