import rehype from 'remark-rehype';
import unist from 'unist-builder';
import { parseText } from 'sylvanas';
import codeHandler from 'mdast-util-to-hast/lib/handlers/code';

/**
 * handle demo type node from parse
 */
function demoHandler(h, { type, lang, value, position, ...props }) {
  // split source codes & raw code for previewer
  const clonedNode = { lang, value };
  const sources = [];

  // push original source code node
  sources.push(codeHandler(h, clonedNode));

  // push transformed source code node for tsx demo (use unshift to keep jsx first)
  if (lang === 'tsx') {
    clonedNode.lang = 'jsx';
    clonedNode.value = parseText(clonedNode.value);
    sources.unshift(codeHandler(h, clonedNode));
  }

  return h(
    position,
    'div',
    {
      type: 'previewer',
      lang,
      ...props,
    },
    [
      // append raw code node
      unist('raw', value),
      // append source code nodes
      ...sources,
    ],
  );
}

export default () => rehype({
  handlers: {
    demo: demoHandler,
  },
  allowDangerousHTML: true,
})
