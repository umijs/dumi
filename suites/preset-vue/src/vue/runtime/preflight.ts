import { createApp, h, nextTick, type App } from 'vue';

export default function preflight(component: any) {
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement('div');
    el.style.display = 'none';
    el.style.overflow = 'hidden';
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
