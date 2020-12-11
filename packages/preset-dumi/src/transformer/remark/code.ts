import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { parseElmAttrToProps } from './utils';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { IDumiUnifiedTransformer, IDumiElmNode } from '.';

/**
 * remark plugin for parse code tag to external demo
 */
export default function code(): IDumiUnifiedTransformer {
  return ast => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      if (is(node, 'code') && has(node, 'src')) {
        const { src, ...attrs } = node.properties;
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: src,
          extensions: ['.tsx', '.jsx'],
        });
        const parsedAttrs = parseElmAttrToProps(attrs);

        // https://github.com/umijs/dumi/issues/418
        // remark-parse will create a extra paragraph ast node as container when <code src="..." /> wraps.
        if (parent.tagName === 'p') {
          // avoid react validateDOMNesting error
          parent.tagName = 'div';
        }

        // replace original node
        parent.children.splice(i, 1, {
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
        });
      }
    });
  };
}
