import { useState, useEffect, useCallback } from 'react';
import type { IPreviewerComponentProps } from '..';

/**
 * execute motions
 * @param wrapper element wrapper
 * @param motions motion data
 * @param cb      callback
 * @param index   current motion index
 */
function runner(
  wrapper: Element,
  motions: IPreviewerComponentProps['motions'],
  cb: Function,
  index: number = 0,
) {
  if (index < motions.length) {
    const current = motions[index];
    const next = () => runner(wrapper, motions, cb, index + 1);
    const [, type, value] = current.match(/^([^:]+):?(.*)$/) || [];

    switch (type) {
      // controls
      case 'autoplay':
        next();
        break;

      // actions
      case 'click':
        // eslint-disable-next-line no-case-declarations
        const [, isGlobal, selector] = value.match(/^(global\()?(.+?)\)?$/) || [];
        // eslint-disable-next-line no-case-declarations
        const container = isGlobal ? document : wrapper;
        // @ts-ignore
        container.querySelector(selector)?.click();
        next();
        break;

      case 'timeout':
        setTimeout(next, Number(value));
        break;

      // boardcasts
      case 'capture':
        window.postMessage({ type: 'dumi:capture-element', value }, '*');
        next();
        break;

      default:
        console.warn(`[dumi: motion] unknown motion '${current}', skip.`);
        next();
    }
  } else {
    cb();
  }
}

/**
 * hook for execute dumi motions
 */
export default (
  motions: IPreviewerComponentProps['motions'],
  wrapper: Element,
): [() => void, boolean] => {
  const [isRunning, setIsRunning] = useState(false);
  const handler = useCallback(() => {
    if (!isRunning) {
      runner(wrapper, motions, () => {
        setIsRunning(false);
      });
      setIsRunning(true);
    }
  }, [motions, wrapper, isRunning]);

  useEffect(() => {
    if (motions[0] === 'autoplay' && wrapper) {
      handler();
    }
  }, [motions, wrapper]);

  return [handler, isRunning];
};
