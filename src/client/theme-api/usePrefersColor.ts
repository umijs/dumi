import { PREFERS_COLOR_ATTR, PREFERS_COLOR_LS_KEY } from '@/constants';
import { useSiteData } from 'dumi';
import { useCallback, useEffect, useState } from 'react';

export type IColorValue = 'light' | 'dark';
export type IPrefersColorValue = IColorValue | 'auto';

let colorChanger: ColorChanger;
class ColorChanger {
  /**
   * current color
   * @note  exclude `auto`
   */
  color: IColorValue;

  /**
   * current prefers color
   * @note  include `auto`
   */
  prefersColor: IPrefersColorValue;

  /**
   * color change callbacks
   */
  private callbacks: ((args: {
    color: IColorValue;
    prefersColor: IPrefersColorValue;
  }) => void)[] = [];

  constructor(opts: { default: string }) {
    this.prefersColor = ((navigator.cookieEnabled &&
      // read from localStorage first, because `auto` will not be set to attr
      localStorage.getItem(PREFERS_COLOR_LS_KEY)) ||
      // then use default value from themeConfig
      opts.default) as IPrefersColorValue;
    this.color = document.documentElement.getAttribute(
      PREFERS_COLOR_ATTR,
    ) as IColorValue;
    // listen prefers color change
    (['light', 'dark'] as IColorValue[]).forEach((color) => {
      const mediaQueryList = this.getColorMedia(color);
      const handler = (ev: any) => {
        // only apply media prefers color in auto mode
        if (ev.matches && this.prefersColor === 'auto') {
          this.color = color;
          document.documentElement.setAttribute(PREFERS_COLOR_ATTR, color);
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
  getColorMedia(color: IPrefersColorValue) {
    return window.matchMedia(`(prefers-color-scheme: ${color})`);
  }

  /**
   * detect color whether matches current color mode
   * @param color   expected color
   */
  isColorMode(color: IPrefersColorValue) {
    return this.getColorMedia(color).matches;
  }

  /**
   * apply all event change callbacks
   */
  applyCallbacks() {
    this.callbacks.forEach((cb) =>
      cb({ color: this.color, prefersColor: this.prefersColor }),
    );
  }

  /**
   * listen color change
   * @param cb  callback
   */
  listen(cb: (typeof this.callbacks)[number]) {
    this.callbacks.push(cb);
  }

  /**
   * unlisten color change
   * @param cb  callback
   */
  unlisten(cb: (typeof this.callbacks)[number]) {
    this.callbacks.splice(this.callbacks.indexOf(cb), 1);
  }

  /**
   * set prefers color
   */
  tryPrefersColor(color: IPrefersColorValue) {
    if (navigator.cookieEnabled) {
      localStorage.setItem(PREFERS_COLOR_LS_KEY, color);
    }
    this.prefersColor = color;
    this.color =
      color === 'auto' ? (this.isColorMode('dark') ? 'dark' : 'light') : color;
    document.documentElement.setAttribute(PREFERS_COLOR_ATTR, this.color);
    this.applyCallbacks();

    return color;
  }
}

/**
 * hook for get/set prefers-color-schema, use to control color mode for theme package
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
 */
export const usePrefersColor = () => {
  const { themeConfig } = useSiteData();
  const [color, setColor] = useState<IColorValue>();
  const [prefersColor, setPrefersColor] = useState<IPrefersColorValue>();
  const tryPrefersColor = useCallback((val: IPrefersColorValue) => {
    colorChanger.tryPrefersColor(val);
  }, []);
  const colorChangeHandler = useCallback(
    (args: { color: IColorValue; prefersColor: IPrefersColorValue }) => {
      setColor(args.color);
      setPrefersColor(args.prefersColor);
    },
    [],
  );

  useEffect(() => {
    // lazy initialize, for SSR
    colorChanger ??= new ColorChanger({
      default: themeConfig.prefersColor.default,
    });
    colorChanger.listen(colorChangeHandler);
    setColor(colorChanger.color);
    setPrefersColor(colorChanger.prefersColor);

    return () => colorChanger.unlisten(colorChangeHandler);
  }, []);

  return [color, prefersColor, tryPrefersColor] as [
    IColorValue,
    IPrefersColorValue,
    typeof tryPrefersColor,
  ];
};
