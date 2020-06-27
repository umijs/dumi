import rehype from 'remark-rehype';
import { parseText } from 'sylvanas';

/**
 * handle demo type node from parse
 */
function demoHandler(h, { type, lang, value, position, ...props }) {
  // split source codes for previewer
  const clonedNode = { lang, value };
  const source: { jsx: string; tsx?: string } = { jsx: clonedNode.value };

  // set source code
  if (lang === 'tsx') {
    source.tsx = source.jsx;
    source.jsx = parseText(source.tsx);
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
