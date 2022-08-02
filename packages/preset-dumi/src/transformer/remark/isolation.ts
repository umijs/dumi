import type { Node } from 'unist';
import type { Visitor } from 'unist-util-visit';
import visit from 'unist-util-visit';
import { REQUIRED_THEME_BUILTINS } from '../../theme/loader';
import type { IDumiElmNode, IDumiUnifiedTransformer } from '.';

/**
 * detect node whether solo rendered node
 * @note  solo node need not to wrap by .markdown container
 * @param node  node
 */
function isSoloNode(node: IDumiElmNode) {
  return Boolean(node.previewer || node.embed);
}

/**
 * detect node whether line break node
 * @param node  node
 */
function isLineBreakNode(node: IDumiElmNode) {
  return node.type === 'text' && /^[\n\r]+$/.test(node.value as string);
}

/**
 * detect node whether .markdown wrapper
 * @param node      node
 * @param className wrapper css class name
 */
function isWrapperNode(node: IDumiElmNode, className: string) {
  return node.properties?.className === className;
}

/**
 * detect node whether user global React component
 * @param node
 */
function isReactComponent(node: IDumiElmNode) {
  return (
    /^[A-Z].+/.test(node.tagName) &&
    !REQUIRED_THEME_BUILTINS.includes(node.tagName) &&
    // FIXME
    !['AnchorLink', 'NavLink', 'Link'].includes(node.tagName)
  );
}

const visitor: Visitor<IDumiElmNode> = function visitor(node) {
  // wrap all noddes except previewer nodes into markdown elements for isolate styles
  node.children = node.children.reduce((result, item) => {
    let prevSibling = result[result.length - 1];
    if (
      isSoloNode(item) ||
      (isLineBreakNode(item) && (!prevSibling || !isWrapperNode(prevSibling, this.className)))
    ) {
      // push item directly if it is solo node or is not break line node before content
      result.push(item);
    } else if (
      // <p><Test></Test></p> or <Test></Test>
      (item.tagName === 'p' && item.children?.length === 1 && isReactComponent(item.children[0])) ||
      isReactComponent(item)
    ) {
      // solo for user custom component
      result.push(item.tagName === 'p' ? item.children?.[0] : item);
    } else {
      // push wrapper element when first loop or the prev node is solo node
      if (!prevSibling || isSoloNode(prevSibling) || isLineBreakNode(prevSibling)) {
        prevSibling = {
          type: 'element',
          tagName: 'div',
          properties: { className: this.className },
          children: [],
        };
        result.push(prevSibling);
      }

      // push item into wrapper element if it is not solo node
      prevSibling.children.push(item);
    }

    return result;
  }, []);
};

export default (options: Record<string, any> = {}): IDumiUnifiedTransformer =>
  (ast: Node) => {
    visit(ast, 'root', visitor.bind({ className: options.className || 'markdown' }));
  };
