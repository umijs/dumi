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
        const nodeIndex = parent.children.findIndex(item => node === item);

        // https://github.com/umijs/dumi/issues/418
        // remark-parse will create a extra paragraph ast node as container when <code src="..." /> wraps.
        if (parent.tagName === 'p') {
          // hold p node when children.length > 1, otherwise, replace p node.
          const shouldHold = parent.children.length > 1;
          parent.children.splice(nodeIndex, 1);
          grandparent.children.splice(
            grandparent.children.findIndex(cur => cur === parent),
            shouldHold ? 0 : 1,
            previewer,
          );
        } else {
          // just replace original node
          parent.children.splice(nodeIndex, 1, previewer);
        }
      }
    });
  };
}
