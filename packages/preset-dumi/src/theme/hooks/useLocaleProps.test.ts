import { renderHook } from '@testing-library/react-hooks';
import useLocaleProps from './useLocaleProps';

describe('theme API: useLocaleProps', () => {
  it('should transform props by locale', () => {
    const { result } = renderHook(() => useLocaleProps('en-US', { title: 2, 'title.en-US': 1 }));

    expect(result.current).toEqual({ title: 1 });
  });
});
