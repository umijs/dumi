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
    let extraReplacement = false;
    visit<IDumiElmNode>(ast, 'element', (node, index, parent) => {
      if (is(node, 'code') && has(node, 'src')) {
        const { src, ...attrs } = node.properties;
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: src,
          extensions: ['.tsx', '.jsx'],
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
            meta: {
              ...parsedAttrs,
            },
          },
        });

        // https://github.com/umijs/dumi/issues/418
        // remark-parse will create a extra paragraph ast node as container when <code src="..." /> wraps.
        if (parent.tagName === 'p') {
          extraReplacement = true;
        }
      }
    });

    if (extraReplacement) {
      visit<IDumiElmNode>(ast, 'element', (node, index, parent) => {
        if (
          is(node, 'p') &&
          node.children?.some(child => is(child, 'div') && child.properties.type === 'previewer')
        ) {
          parent.children.splice(
            index,
            1,
            ...node.children.reduce((hoists, child) => {
              if (child.properties?.type === 'previewer') {
                hoists.push(child);
              } else {
                const latestHoist = hoists[hoists.length - 1];
                if (!latestHoist || latestHoist.properties.type === 'previewer') {
                  hoists.push({
                    type: 'element',
                    tagName: 'p',
                    properties: {},
                    children: [],
                  });
                }

                hoists[hoists.length - 1].children.push(child);
              }
              return hoists;
            }, [] as IDumiElmNode[]),
          );

          return [visit.SKIP, index];
        }
      });
    }
  };
}
