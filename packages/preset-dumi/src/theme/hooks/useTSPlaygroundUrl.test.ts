import { renderHook } from '@testing-library/react-hooks';
import useTSPlaygroundUrl from './useTSPlaygroundUrl';

describe('theme API: useTSPlaygroundUrl', () => {
  it('should return zh-CN url', () => {
    const { result } = renderHook(() => useTSPlaygroundUrl('zh-CN', 'export default () => null'));

    expect(result.current).toContain(
      'https://www.typescriptlang.org/zh/play?skipLibCheck=true&jsx=1',
    );
  });

  it('should fallback en-US url', () => {
    const { result } = renderHook(() => useTSPlaygroundUrl('unknown', 'export default () => null'));

    expect(result.current).toContain('https://www.typescriptlang.org/play?skipLibCheck=true&jsx=1');
  });
});
