import type { IDemoCancelableFn } from 'dumi/dist/client/theme-api';
import { createApp, h, nextTick, type App } from 'vue';

function tryRender(component: any) {
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement('div');
    el.style.width = '0';
    el.style.height = '0';
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    let app!: App;
    function destroy() {
      nextTick(() => {
        app.config.errorHandler = void 0;
        app.unmount();
        el.remove();
      });
    }
    app = createApp({
      mounted() {
        resolve();
        destroy();
      },
      render() {
        return h(component);
      },
    });
    app.config.warnHandler = (msg) => {
      destroy();
      reject(new Error(msg));
    };
    app.config.errorHandler = (error) => {
      destroy();
      reject(error);
    };
    app.mount(el);
  });
}

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
  //  check component is able to render, to avoid show vue overlay error
  await tryRender(component);
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
