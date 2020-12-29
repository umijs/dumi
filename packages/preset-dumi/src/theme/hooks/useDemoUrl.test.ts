import { renderHook } from '@testing-library/react-hooks';
import useDemoUrl from './useDemoUrl';

describe('theme API: useDemoUrl', () => {
  const saved = window.location;
  delete window.location;
  window.location = {
    ...saved,
    href: `http://localhost/`,
  } as Window['location'];

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

  it('should return basement-compatible demo url', () => {
    const oType = process.env.PLATFORM_TYPE;

    process.env.PLATFORM_TYPE = 'BASEMENT';
    const { result } = renderHook(() => useDemoUrl('test'));

    expect(result.current).toEqual('http://localhost/_demos/test/index.html');

    window.location.href += '#/';
    const { result: hashResult } = renderHook(() => useDemoUrl('test'));
    expect(hashResult.current).toEqual(`http://localhost/#/_demos/test/index.html`);

    window.location.href = `http://localhost/#/123#anchor`;
    const { result: hashResult0 } = renderHook(() => useDemoUrl('test'));
    expect(hashResult0.current).toEqual(`http://localhost/#/_demos/test/index.html`);

    window.location.href = `http://localhost/prefix/path/#/123#anchor`;
    const { result: hashResult1 } = renderHook(() => useDemoUrl('test'));
    expect(hashResult1.current).toEqual(`http://localhost/prefix/path/#/_demos/test/index.html`);

    process.env.PLATFORM_TYPE = oType;
  });
});
