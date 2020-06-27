import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';

/**
 * rehype plugin for convert code block to SourceCode compomnent
 */
export default () => {
  return tree => {
    visit(tree, 'element', (node, i, parent) => {
      if (node.tagName === 'pre' && node.children?.[0]?.tagName === 'code') {
        const cls = node.children[0].properties.className || [];
        const lang = cls.join('').match(/language-(\w+)(?:$| )/)?.[1] || 'unknown';

        (parent.children as any).splice(i, 1, {
          type: 'element',
          position: node.position,
          tagName: 'SourceCode',
          properties: {
            // use wrapper element to workaround for skip props escape
            // https://github.com/mapbox/jsxtreme-markdown/blob/main/packages/hast-util-to-jsx/index.js#L159
            // eslint-disable-next-line no-new-wrappers
            code: new String(JSON.stringify(toString(node.children[0]))),
            lang,
          },
        });
      }
    });
  };
};
