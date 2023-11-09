import { createApp } from 'vue';

export async function renderToCanvas(canvas: Element, component: any) {
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

  app.config.errorHandler = (e) => console.error(e);
  app.mount(canvas);
  return () => {
    app.unmount();
  };
}
