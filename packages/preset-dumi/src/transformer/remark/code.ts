import fs from 'fs';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { parseText } from 'sylvanas';
import { parseElmAttrToProps } from './utils';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { saveFileOnDepChange } from '../../utils/watcher';
import transformer from '..';
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
        const lang = absPath.match(/\.(\w+)$/)[1];

        // read external demo content and convert node to demo node
        const result = transformer.code(fs.readFileSync(absPath).toString());
        const parsedAttrs = parseElmAttrToProps(attrs);

        // replace original node
        parent.children.splice(i, 1, {
          type: 'element',
          tagName: 'div',
          position: node.position,
          properties: {
            type: 'previewer',
            source:
              lang === 'tsx'
                ? {
                    jsx: parseText(result.content),
                    tsx: result.content,
                  }
                : { jsx: result.content },
            filePath: absPath,
            meta: {
              ...parsedAttrs,
              ...result.meta,
            },
          },
        });

        // trigger parent markdown file change after this file changed
        saveFileOnDepChange(this.data('fileAbsPath'), absPath);
      }
    });
  };
}
