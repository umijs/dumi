import { useState, useEffect, useCallback } from 'react';

const COLOR_ATTR_NAME = 'data-prefers-color';
const COLOR_LS_NAME = 'dumi:prefers-color';

export type PrefersColorValue = 'dark' | 'light' | 'auto';

let colorChanger: ColorChanger;
class ColorChanger {
  /**
   * current color
   * @note  initial value from head script in src/plugins/theme.ts
   */
  color: PrefersColorValue;

  /**
   * color change callbacks
   */
  private callbacks: ((color: PrefersColorValue) => void)[] = [];

  constructor() {
    this.color = (localStorage.getItem(COLOR_LS_NAME) ||
      document.documentElement.getAttribute(COLOR_ATTR_NAME)) as PrefersColorValue;
    // listen prefers color change
    (['light', 'dark'] as PrefersColorValue[]).forEach(color => {
      const mediaQueryList = this.getColorMedia(color);
      const handler = (ev: any) => {
        // only apply media prefers color in auto mode
        if (ev.matches && this.color === 'auto') {
          document.documentElement.setAttribute(COLOR_ATTR_NAME, color);
          this.applyCallbacks();
        }
      };
      // compatible with Safari 13-
      /* istanbul ignore else */
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', handler);
      } else if (mediaQueryList.addListener) {
        mediaQueryList.addListener(handler);
      }
    });
  }

  /**
   * get media instance for prefers color
   * @param color   prefers color
   */
  getColorMedia(color: PrefersColorValue) {
    return window.matchMedia(`(prefers-color-scheme: ${color})`);
  }

  /**
   * detect color whether matches current color mode
   * @param color   expected color
   */
  isColorMode(color: PrefersColorValue) {
    return this.getColorMedia(color).matches;
  }

  /**
   * apply all event change callbacks
   */
  applyCallbacks() {
    this.callbacks.forEach(cb => cb(this.color));
  }

  /**
   * listen color change
   * @param cb  callback
   */
  listen(cb: (color: PrefersColorValue) => void) {
    this.callbacks.push(cb);
  }

  /**
   * unlisten color change
   * @param cb  callback
   */
  unlisten(cb: (color: PrefersColorValue) => void) {
    this.callbacks.splice(this.callbacks.indexOf(cb), 1);
  }

  /**
   * set prefers color
   */
  set(color: PrefersColorValue) {
    this.color = color;
    localStorage.setItem(COLOR_LS_NAME, color);
    this.applyCallbacks();

    if (color === 'auto') {
      document.documentElement.setAttribute(
        COLOR_ATTR_NAME,
        this.isColorMode('dark') ? 'dark' : 'light',
      );
    } else {
      document.documentElement.setAttribute(COLOR_ATTR_NAME, color);
    }

    return color;
  }
}

/**
 * hook for get/set prefers-color-schema, use to control color mode for theme package
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
 */
export default () => {
  const [color, setColor] = useState<PrefersColorValue>();
  const changeColor = useCallback((val: PrefersColorValue) => {
    colorChanger.set(val);
  }, []);

  useEffect(() => {
    // lazy initialize, for SSR
    colorChanger = colorChanger || new ColorChanger();
    colorChanger.listen(setColor);
    setColor(colorChanger.color);

    return () => colorChanger.unlisten(setColor);
  }, []);

  return [color, changeColor] as [PrefersColorValue, typeof changeColor];
};
