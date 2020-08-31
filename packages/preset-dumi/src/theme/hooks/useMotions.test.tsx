import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import useMotions from './useMotions';

describe('theme API: useMotions', () => {
  const Counter = () => {
    const [count, setCount] = useState(0);

    return <button onClick={() => setCount(count + 1)}>{count}</button>;
  };

  it('should execute motions when trigger', async () => {
    const wrapper = render(<Counter />);
    const { result } = renderHook(() =>
      useMotions(['click:button', 'timeout:300', 'capture:button'], wrapper.container),
    );

    act(() => {
      // expect not running & count is 0
      expect(result.current[1]).toBeFalsy();
      expect(screen.queryByText('0')).not.toBeNull();

      // trigger motions
      result.current[0]();
    });

    // expect running
    expect(result.current[1]).toBeTruthy();

    // listen post message for capture element
    await new Promise(resolve => {
      const msgHandler = (ev: any) => {
        if (ev.data.type === 'dumi:capture-element') {
          expect(ev.data.value).toEqual('button');
          window.removeEventListener('message', msgHandler);
          resolve();
        }
      };

      window.addEventListener('message', msgHandler);
    });

    // expect not running & count is 1
    expect(result.current[1]).toBeFalsy();
    expect(screen.queryByText('1')).not.toBeNull();
  });

  it('should autoplay & skip unknown motion', async () => {
    const wrapper = render(<Counter />);
    const { result, waitForValueToChange } = renderHook(() =>
      useMotions(['autoplay', 'click:button', 'unknown'], wrapper.container),
    );

    // wait for motions complete
    waitForValueToChange(() => result.current[1]);

    // expect count is 1
    expect(screen.queryByText('1')).not.toBeNull();
  });
});
