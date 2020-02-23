import { Node } from 'unist';
import visit from 'unist-util-visit';

function visitor(node) {
  // wrap all noddes except previewer nodes into markdown elements for isolate styles
  node.children = node.children.reduce((result, item) => {
    // push wrapper element when first loop or the prev node is previewer node
    if (!result.length || result[result.length - 1].previewer) {
      result.push({
        type: 'element',
        tagName: 'div',
        properties: { className: this.className },
        children: [],
      });
    }

    if (item.previewer) {
      // push item directly if it is previewer node
      result.push(item);
    } else {
      // push item into wrapper element if it is not previewer node
      result[result.length - 1].children.push(item);
    }

    return result;
  }, []);
}

export default (options: { [key: string]: any } = {}) => (ast: Node) => {
  visit(ast, 'root', visitor.bind({ className: options.className || 'markdown' }));
};
