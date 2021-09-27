import type { Plugin } from 'unified';
import oRehype from 'remark-rehype';

/**
 * handle demo type node from parse
 */
function demoHandler(h, { type, lang, value, position, ...props }) {
  // split source codes for previewer
  const clonedNode = { lang, value };

  return h(position, 'div', {
    type: 'previewer',
    lang,
    source: clonedNode.value,
    ...props,
  });
}

export default (function rehype() {
  return oRehype.call(this, {
    handlers: {
      demo: demoHandler,
    },
    allowDangerousHtml: true,
  });
} as Plugin);
