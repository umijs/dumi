import type { Node } from 'unist';
import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';
import raw from 'hast-util-raw';
import { winEOL } from '@umijs/utils';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';

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
export default function sourceCode(): IDumiUnifiedTransformer {
  return ast => {
    // handle md code block syntax
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      if (node.tagName === 'pre' && node.children?.[0]?.tagName === 'code') {
        const cls = node.children[0].properties.className || [];
        const lang = cls.join('').match(/language-(\w+)(?:$| )/)?.[1] || 'unknown';

        parent.children.splice(
          i,
          1,
          createSourceCode(lang, winEOL(toString(node.children[0]).trim()), node.position),
        );
      }
    });

    // handle pre tag syntax
    visit<Node & { value: string }>(ast, 'raw', (node, i, parent) => {
      if (/^<pre/.test(node.value)) {
        const parsed = raw(node) as IDumiElmNode;

        if (parsed.tagName === 'pre') {
          const [, content] = winEOL(node.value).match(/^<pre[^>]*>\n?([^]*?)<\/pre>$/) || [];

          if (content) {
            parent.children.splice(
              i,
              1,
              createSourceCode(parsed.properties.lang, content.trim(), node.position),
            );
          }
        }
      }
    });
  };
}
