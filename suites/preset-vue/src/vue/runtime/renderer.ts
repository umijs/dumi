import type { IDemoCancelableFn } from 'dumi/dist/client/theme-api';
import { createApp } from 'vue';

const renderer: IDemoCancelableFn = async function (
  canvas,
  component,
  options,
) {
  if (component.__css__) {
    setTimeout(() => {
      document
        .querySelectorAll(`style[css-${component.__id__}]`)
        .forEach((el) => el.remove());
      document.head.insertAdjacentHTML(
        'beforeend',
        `<style css-${component.__id__}>${component.__css__}</style>`,
      );
    }, 1);
  }
  const app = createApp(component);

  app.config.errorHandler = function (err) {
    options?.onRuntimeError?.(err as Error);
  };
  app.mount(canvas);
  return () => {
    app.unmount();
  };
};

export default renderer;
