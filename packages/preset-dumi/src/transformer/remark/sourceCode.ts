import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';
import raw from 'hast-util-raw';

function createSourceCode(lang: string, code: string, position: any) {
  return {
    type: 'element',
    tagName: 'SourceCode',
    position,
    properties: {
      // use wrapper element to workaround for skip props escape
      // https://github.com/mapbox/jsxtreme-markdown/blob/main/packages/hast-util-to-jsx/index.js#L159
      // eslint-disable-next-line no-new-wrappers
      code: new String(JSON.stringify(code)),
      lang: lang || 'unknown',
    },
  };
}

/**
 * rehype plugin for convert code block to SourceCode compomnent
 */
export default () => {
  return ast => {
    // handle md code block syntax
    visit(ast, 'element', (node, i, parent) => {
      if (node.tagName === 'pre' && node.children?.[0]?.tagName === 'code') {
        const cls = node.children[0].properties.className || [];
        const lang = cls.join('').match(/language-(\w+)(?:$| )/)?.[1] || 'unknown';

        (parent.children as any).splice(
          i,
          1,
          createSourceCode(lang, toString(node.children[0]), node.position),
        );
      }
    });

    // handle pre tag syntax
    visit(ast, 'raw', (node, i, parent) => {
      if (/^<pre/.test(node.value as string)) {
        const parsed = raw(node);

        if (parsed.tagName === 'pre') {
          const [, content] = (node.value as string).match(/^<pre[^>]*>\n?([^]*?)<\/pre>$/) || [];

          if (content) {
            (parent.children as any).splice(
              i,
              1,
              createSourceCode(parsed.properties?.lang, content, node.position),
            );
          }
        }
      }
    });
  };
};
