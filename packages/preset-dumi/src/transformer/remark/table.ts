import visit from 'unist-util-visit';
import is from 'hast-util-is-element';
import type { IDumiElmNode, IDumiUnifiedTransformer } from '.';

/**
 * rehype plugin to handle table element to component
 */
export default function table(): IDumiUnifiedTransformer {
  return ast => {
    visit<IDumiElmNode>(ast, 'element', node => {
      if (is(node, 'table')) {
        node.tagName = 'Table';
      }
    });
  };
}
