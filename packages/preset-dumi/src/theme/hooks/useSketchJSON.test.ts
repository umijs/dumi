import { renderHook, act } from '@testing-library/react-hooks';
import useSketchJSON from './useSketchJSON';

describe('theme API: useSketchJSON', () => {
  let oGetSelection: any;

  beforeAll(() => {
    oGetSelection = document.getSelection;
    // mock get selection method
    document.getSelection = (() => ({})) as any;
  });

  afterAll(() => {
    document.getSelection = oGetSelection;
  });

  it('should return generateGroup handler & status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSketchJSON());

    const { generateGroup, copyGroupStatus } = result.current;

    expect(copyGroupStatus).toEqual('ready');

    act(() => {
      // trigger copy (without validation because document.getSelection not working)
      generateGroup([]);
    });

    expect(result.current.copyGroupStatus).toEqual('copied');

    // wait for status reset
    await waitForNextUpdate({ timeout: 2000 });
    expect(result.current.copyGroupStatus).toEqual('ready');
  });
  it('should return generateSymbol handler & status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSketchJSON());

    const { generateSymbol, copySymbolStatus } = result.current;

    expect(copySymbolStatus).toEqual('ready');

    act(() => {
      // trigger copy (without validation because document.getSelection not working)
      generateSymbol([]);
    });

    expect(result.current.copySymbolStatus).toEqual('copied');

    // wait for status reset
    await waitForNextUpdate({ timeout: 2000 });
    expect(result.current.copySymbolStatus).toEqual('ready');
  });
});
