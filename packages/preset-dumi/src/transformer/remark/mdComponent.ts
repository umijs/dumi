import is from 'hast-util-is-element';
import visit from 'unist-util-visit';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';
import type { Transformer } from 'unified';

type ICompiler = (
  node: Parameters<visit.Visitor<IDumiElmNode>>[0],
  index: Parameters<visit.Visitor<IDumiElmNode>>[1],
  parent: Parameters<visit.Visitor<IDumiElmNode>>[2],
  vFile: Parameters<Transformer>[1],
) => void;

export interface IMarkdwonComponent {
  /**
   * The markdown component name which should always start with a capital letter
   */
  name: string;
  /**
   * The component path
   */
  component: string;
  /**
   * The compiler function about how to parse the HTML Abstract Syntax Tree parse by rehype
   * @refer https://github.com/syntax-tree/hast
   */
  compiler: ICompiler;
}

const markdownComponents: IMarkdwonComponent[] = [];
export function registerMdComponent(comp: IMarkdwonComponent) {
  const target = markdownComponents.find(item => item.name === comp.name);
  if (target) {
    // replace the existed one
    Object.assign(target, comp);
  } else {
    markdownComponents.push(comp);
  }
}

/**
 * remark plugin for parsing the customize markdwon components
 */
export default function mdComponent(): IDumiUnifiedTransformer {
  return (ast, vFile) => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      const componentNames = markdownComponents.map(a => a.name);
      if (is(node, componentNames) && !node._dumi_parsed) {
        const target = markdownComponents.find(item => item.name === node.tagName);
        // mark this node as a parsed node by dumi
        node._dumi_parsed = true;
        target.compiler.call(this, node, i, parent, vFile);
      }
    });
  };
}
