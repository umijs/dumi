import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { parseElmAttrToProps } from './utils';
import { previewerTransforms } from './previewer';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';

/**
 * remark plugin for parse code tag to external demo
 */
export default function code(): IDumiUnifiedTransformer {
  return ast => {
    visit<IDumiElmNode>(ast, 'element', (node, index, parent) => {
      if (is(node, 'code') && has(node, 'src')) {
        const { src, ...attrs } = node.properties;
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: src,
          // allow ts/js demo if there has custom compiletime transformer
          ...(previewerTransforms.length > 1 ? {} : { extensions: ['.tsx', '.jsx'] }),
        });
        const parsedAttrs = parseElmAttrToProps(attrs);

        // replace original node
        parent.children.splice(index, 1, {
          type: 'element',
          tagName: 'div',
          position: node.position,
          properties: {
            type: 'previewer',
            filePath: absPath,
            src,
            meta: {
              ...parsedAttrs,
            },
          },
        });
      }
    });
  };
}
