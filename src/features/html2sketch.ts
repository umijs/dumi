import type { IApi } from '../types';

const SCRIPT_URL =
  'https://gw.alipayobjects.com/os/lib/html2sketch/1.0.1/dist/html2sketch.min.js';
const CONTAINER_ATTR = 'data-html2sketch-container';

export default (api: IApi) => {
  api.describe({
    key: 'html2sketch',
    config: {
      schema: (Joi) => Joi.object({ scriptUrl: Joi.string().optional() }),
    },
  });

  // add exports for html2sketch
  api.onGenerateFiles(() => {
    if (api.config.html2sketch) {
      api.writeTmpFile({
        path: 'msgExecutor.ts',
        content: `import { getSketchJSON } from '.';

window.addEventListener('message', (ev) => {
  if (ev.data.type === 'dumi.html2sketch.exec') {
    const { value: opts, token } = ev.data;

    getSketchJSON(document, opts).then((value) => {
      window.postMessage({ type: 'dumi.html2sketch.done', value, token }, '*');
    });
  }
});
`,
      });
    }

    api.writeTmpFile({
      path: 'index.ts',
      content: `import type { nodeToGroup, nodeToSymbol, SketchFormat } from 'html2sketch';

const html2sketch = typeof window !== 'undefined' ? window.html2sketch as {
  nodeToGroup: typeof nodeToGroup;
  nodeToSymbol: typeof nodeToSymbol;
} : null;

async function toSketchJSON(
  node: HTMLElement,
  opts: { type: 'group' | 'symbol' },
) {
  return opts.type === 'group'
    ? (await html2sketch.nodeToGroup(node)).toSketchJSON()
    : (await html2sketch.nodeToSymbol(node)).toSketchJSON();
}

export const getSketchJSON = ${
        api.config.html2sketch
          ? `(
  target: HTMLElement | Document,
  opts: Parameters<typeof toSketchJSON>[1],
): ReturnType<typeof toSketchJSON> => {
  let node = target;

  // handle iframe demo & post message executor
  if (!(target instanceof HTMLElement) || target.tagName === 'IFRAME') {
    const doc = target instanceof HTMLIFrameElement ? target.contentDocument! : target;

    node = doc.querySelector('[${CONTAINER_ATTR}], #${api.config.mountElementId}');
  }

  return toSketchJSON(node, opts);
}`
          : 'null'
      };
`,
    });
  });

  api.addEntryImports(() =>
    api.config.html2sketch
      ? { source: '@@/plugin-html2sketch/msgExecutor' }
      : [],
  );

  // add html2sketch script
  api.addHTMLHeadScripts(() => {
    return api.config.html2sketch
      ? [api.config.html2sketch.scriptUrl || SCRIPT_URL]
      : [];
  });
};
