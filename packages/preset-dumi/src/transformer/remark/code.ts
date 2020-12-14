import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit-parents';
import { parseElmAttrToProps } from './utils';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { IDumiUnifiedTransformer, IDumiElmNode } from '.';

/**
 * remark plugin for parse code tag to external demo
 */
export default function code(): IDumiUnifiedTransformer {
  return ast => {
    visit<IDumiElmNode>(ast, 'element', (node, ancestor) => {
      if (is(node, 'code') && has(node, 'src')) {
        const { src, ...attrs } = node.properties;
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: src,
          extensions: ['.tsx', '.jsx'],
        });
        const parsedAttrs = parseElmAttrToProps(attrs);

        const previewer = {
          type: 'element',
          tagName: 'div',
          position: node.position,
          properties: {
            type: 'previewer',
            filePath: absPath,
            meta: {
              ...parsedAttrs,
            },
          },
        };
        const len = ancestor.length;
        const grandparent = ancestor[len - 2] as IDumiElmNode;
        const parent = ancestor[len - 1] as IDumiElmNode;
        const nodeIndex = parent.children.indexOf(node);

        // https://github.com/umijs/dumi/issues/418
        // remark-parse will create a extra paragraph ast node as container when <code src="..." /> wraps.
        if (parent.tagName === 'p') {
          const hoists = parent.children.slice(0, nodeIndex).map<IDumiElmNode>(n =>
            // only wrap text node
            n.type === 'text'
              ? {
                  type: 'element',
                  tagName: 'p',
                  properties: {},
                  children: [n],
                }
              : n,
          );
          hoists.push(previewer);
          parent.children = parent.children.slice(nodeIndex + 1);
          const shouldHold = parent.children.length > 0;
          const parentIndex = grandparent.children.indexOf(parent);

          grandparent.children.splice(parentIndex, shouldHold ? 0 : 1, ...hoists);
        } else {
          // just replace original node
          parent.children.splice(nodeIndex, 1, previewer);
        }
      }
    });
  };
}
