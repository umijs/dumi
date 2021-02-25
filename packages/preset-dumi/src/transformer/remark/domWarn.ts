import visit from 'unist-util-visit-parents';
import is from 'hast-util-is-element';
import type { IDumiElmNode, IDumiUnifiedTransformer } from '.';

const NO_PARAGRAPH_RULES: { type: string; tagName: string; [key: string]: any }[] = [
  { type: 'element', tagName: 'code', properties: { src: Boolean } },
  { type: 'element', tagName: 'embed', properties: { src: Boolean } },
  { type: 'element', tagName: 'API' },
];

/**
 * loose compare node properties for check matching
 * @param oProps  original properties
 * @param eProps  equal properties
 */
function looseCompareProps(oProps: Record<string, any>, eProps: Record<string, any>) {
  return Object.entries(eProps).every(([name, value]) => {
    if (typeof value !== 'object') {
      return typeof value === 'function' ? value(oProps[name]) : oProps[name] === value;
    }

    return looseCompareProps(oProps[name], value);
  });
}

/**
 * rehype plugin for prevent DOM validation warnings from React
 * @note  semantic DOM nesting relationship
 */
export default function domWarn(): IDumiUnifiedTransformer {
  return ast => {
    visit(ast, 'element', (node: IDumiElmNode, ancestors) => {
      // only process the p elements below the root
      if (
        is(node, 'p') &&
        ancestors[0].type === 'root' &&
        ancestors.length === 1
      ) {
        const nodes: IDumiElmNode[] = [];

        // visit all children for p element
        node.children.forEach(child => {
          if (NO_PARAGRAPH_RULES.some(rule => looseCompareProps(child, rule))) {
            // hoist to parent level for matched node
            nodes.push(child);
          } else {
            // push empty p element if there has not valid p element
            if (!nodes.length || !is(nodes[nodes.length - 1], 'p')) {
              // FIXME: make sure the position data correctly
              nodes.push({ ...node, children: [] });
            }

            // push child into p element
            nodes[nodes.length - 1].children.push(child);
          }
        });

        // replace original p element if there has matched node(s)
        if (nodes.length > 1 || !is(nodes[0], 'p')) {
          const parent = ancestors[ancestors.length - 1] as IDumiElmNode;

          parent.children.splice(parent.children.indexOf(node), 1, ...nodes);
        }

        return visit.SKIP;
      }
    });
  };
}
