import { Node } from 'unist';
import visit from 'unist-util-visit';

function isDemoNode(node) {
  return (
    node.children
    && node.children.length === 1
    && node.children[0].type === 'raw'
  );
}

function visitor(node) {
  // wrap all noddes except demo nodes into markdown elements for isolate styles
  node.children = node.children.reduce((result, item) => {
    // push wrapper element when first loop or the prev node is demo node
    if (!result.length || isDemoNode(result[result.length - 1])) {
      result.push({
        type: 'element',
        tagName: 'div',
        properties: { className: this.className },
        children: [],
      });
    }

    if (isDemoNode(item)) {
      // push item directly if it is demo node
      result.push(item);
    } else {
      // push item into wrapper element if it is not demo node
      result[result.length - 1].children.push(item);
    }

    return result;
  }, []);
}

export default (options: { [key: string]: any } = {}) => (ast: Node) => {
  visit(ast, 'root', visitor.bind({ className: options.className || 'markdown-body' }));
}
