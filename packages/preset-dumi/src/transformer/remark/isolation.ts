import type { Node } from 'unist';
import type { Visitor } from 'unist-util-visit';
import visit from 'unist-util-visit';
import type { IDumiElmNode, IDumiUnifiedTransformer } from '.';

/**
 * detect node whether solo rendered node
 * @note  solo node need not to wrap by .markdown container
 * @param node  node
 */
function isSoloNode(node: IDumiElmNode) {
  return Boolean(node.previewer || node.embed);
}

const visitor: Visitor<IDumiElmNode> = function visitor(node) {
  // wrap all noddes except previewer nodes into markdown elements for isolate styles
  node.children = node.children.reduce((result, item) => {
    if (isSoloNode(item)) {
      // push item directly if it is solo node
      result.push(item);
    } else {
      // push wrapper element when first loop or the prev node is solo node
      if (!result.length || isSoloNode(result[result.length - 1])) {
        result.push({
          type: 'element',
          tagName: 'div',
          properties: { className: this.className },
          children: [],
        });
      }

      // push item into wrapper element if it is not solo node
      result[result.length - 1].children.push(item);
    }

    return result;
  }, []);
};

export default (options: Record<string, any> = {}): IDumiUnifiedTransformer => (ast: Node) => {
  visit(ast, 'root', visitor.bind({ className: options.className || 'markdown' }));
};
