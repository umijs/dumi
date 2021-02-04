import { useState, useEffect, useCallback } from 'react';

const COLOR_ATTR_NAME = 'data-prefers-color';
const COLOR_LS_NAME = 'dumi:prefers-color';
const COLOR_MAPPING = {
  light: 'dark',
  dark: 'light',
};
const colorChanger = new (class {
  /**
   * current color
   * @note  initial value from head script in src/plugins/theme.ts
   */
  color = document.documentElement.getAttribute(COLOR_ATTR_NAME);

  /**
   * color change callbacks
   */
  private callbacks: ((color: string) => void)[] = [];

  constructor() {
    // listen prefers color change
    Object.keys(COLOR_MAPPING).forEach(color => {
      this.getColorMedia(color).addEventListener('change', (ev) => {
        // only apply media prefers color when user did not configure theme
        if (ev.matches && !localStorage.getItem(COLOR_LS_NAME)) {
          this.color = color;
          document.documentElement.setAttribute(COLOR_ATTR_NAME, color);
          this.applyCallbacks();
        }
      });
    });
  }

  /**
   * get media instance for prefers color
   * @param color   prefers color
   */
  getColorMedia(color: string) {
    return window.matchMedia(`(prefers-color-scheme: ${color})`);
  }

  /**
   * detect color whether matches current color mode
   * @param color   expected color
   */
  isColorMode(color: string) {
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
  listen(cb: (color: string) => void) {
    this.callbacks.push(cb);
  }

  /**
   * unlisten color change
   * @param cb  callback
   */
  unlisten(cb: (color: string) => void) {
    this.callbacks.splice(this.callbacks.indexOf(cb), 1);
  }

  /**
   * change prefers color
   */
  toggle() {
    const targetColor = COLOR_MAPPING[this.color];

    document.documentElement.setAttribute(COLOR_ATTR_NAME, targetColor);
    this.color = targetColor;

    // save prefers color to local storage if it is different with media rule
    if (!this.isColorMode(targetColor)) {
      localStorage.setItem(COLOR_LS_NAME, targetColor);
    } else {
      localStorage.removeItem(COLOR_LS_NAME);
    }

    return targetColor;
  }
})();

/**
 * hook for get/toggle prefers-color-schema, use to control color mode for theme package
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
 */
export default (): [string, () => void] => {
  const [color, setColor] = useState(colorChanger.color);
  const toggleColor = useCallback(() => {
    setColor(colorChanger.toggle());
  }, []);

  useEffect(() => {
    colorChanger.listen(setColor);

    return () => colorChanger.unlisten(setColor);
  }, []);

  return [color, toggleColor];
};
