import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { parseElmAttrToProps, replaceNode } from './utils';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { IDumiUnifiedTransformer, IDumiElmNode } from '.';

/**
 * remark plugin for parse code tag to external demo
 */
export default function code(): IDumiUnifiedTransformer {
  return (ast: IDumiElmNode) => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      if (is(node, 'code') && has(node, 'src')) {
        const { src, ...attrs } = node.properties;
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: src,
          extensions: ['.tsx', '.jsx'],
        });
        const parsedAttrs = parseElmAttrToProps(attrs);

        const previewerNode = {
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

        // https://github.com/umijs/dumi/issues/418
        // remark-parse will create a extra paragraph ast node as container when <code src="..." /> wraps.
        // so we replace `parent` to avoid react validateDOMNesting error.
        if (parent.tagName === 'p') {
          replaceNode(ast, parent as IDumiElmNode, previewerNode);
          return;
        }

        // replace original node
        parent.children.splice(i, 1, previewerNode);
      }
    });
  };
}
