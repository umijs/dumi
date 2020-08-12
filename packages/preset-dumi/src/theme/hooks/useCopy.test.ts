import { renderHook, act } from '@testing-library/react-hooks';
import useCopy from './useCopy';

describe('theme API: useCopy', () => {
  let oGetSelection: any;

  beforeAll(() => {
    oGetSelection = document.getSelection;
    // mock get selection method
    document.getSelection = (() => ({})) as any;
  });

  afterAll(() => {
    document.getSelection = oGetSelection;
  });

  it('should return copy handler & status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCopy());

    expect(result.current[1]).toEqual('ready');

    act(() => {
      // trigger copy (without validation because document.getSelection not working)
      result.current[0]('');
    });

    expect(result.current[1]).toEqual('copied');

    // wait for status reset
    await waitForNextUpdate({ timeout: 2000 });
    expect(result.current[1]).toEqual('ready');
  });
});
