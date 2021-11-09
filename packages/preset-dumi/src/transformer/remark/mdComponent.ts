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
  name: string;
  component: string;
  compiler: ICompiler;
}

const markdownComponents: IMarkdwonComponent[] = [];
export function registerMdComponent(comp: IMarkdwonComponent) {
  markdownComponents.push(comp);
}

/**
 * remark plugin for parsing the customize markdwon components
 */
export default function mdComponent(): IDumiUnifiedTransformer {
  return (ast, vFile) => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      if (
        is(
          node,
          markdownComponents.map(a => a.name),
        ) &&
        !node._dumi_parsed
      ) {
        const target = markdownComponents.find(item => item.name === node.tagName);
        target.compiler.call(this, node, i, parent, vFile);
      }
    });
  };
}
