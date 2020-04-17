import rehype from 'remark-rehype';
import unist from 'unist-builder';
import { parseText } from 'sylvanas';
import codeHandler from 'mdast-util-to-hast/lib/handlers/code';

/**
 * handle demo type node from parse
 */
function demoHandler(h, { type, lang, value, position, ...props }) {
  // split source codes for previewer
  const clonedNode = { lang, value };
  const source = {};

  // set source code
  if (lang === 'tsx') {
    source.tsx = clonedNode.value;
    source.jsx = parseText(clonedNode.value);
  } else {
    source.jsx = clonedNode.value;
  }

  return h(position, 'div', {
    type: 'previewer',
    lang,
    source,
    ...props,
  });
}

export default () =>
  rehype({
    handlers: {
      demo: demoHandler,
    },
    allowDangerousHTML: true,
  });
