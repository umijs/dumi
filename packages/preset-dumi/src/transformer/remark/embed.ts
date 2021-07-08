import fs from 'fs';
import url from 'url';
import path from 'path';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';
import { getFileRangeLines, getFileContentByRegExp } from '../../utils/getFileContent';
import { isDynamicEnable } from '../utils';
import transformer from '..';

export const EMBED_SLUGS = 'dumi-embed-file-slugs';

/**
 * remark plugin for parse embed tag to external module
 */
export default function embed(): IDumiUnifiedTransformer {
  return ast => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent: IDumiElmNode) => {
      if (is(node, 'embed') && has(node, 'src')) {
        const { src } = node.properties;
        const parsed = url.parse(src);
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: parsed.pathname,
          extensions: [],
          silent: true,
        });

        if (absPath) {
          const hash = decodeURIComponent(parsed.hash || '').replace('#', '');
          const query = new URLSearchParams();
          let content = fs.readFileSync(absPath, 'utf8').toString();

          // generate loader query
          if (hash[0] === 'L') {
            query.append('range', hash);
            content = getFileRangeLines(
              content,
              hash,
            );
          } else if (hash.startsWith('RE-')) {
            query.append('regexp', hash.substring(3));
            content = getFileContentByRegExp(
              content,
              hash.substring(3),
              absPath,
            );
          }

          const moduleReqPath = `${absPath}${String(query) ? `?${query}` : ''}`;

          // process node via file type
          switch (path.extname(parsed.pathname)) {
            case '.md':
            default:
              // replace original node
              parent.children.splice(i, 1, {
                type: 'element',
                tagName: 'React.Fragment',
                properties: {
                  // eslint-disable-next-line no-new-wrappers
                  children: new String(
                    `React.createElement(${isDynamicEnable()
                      ? `dynamic({
                          loader: async () => import(/* webpackChunkName: "embedded_md" */ '${moduleReqPath}'),
                        })`
                      : `require('${moduleReqPath}').default`
                    })`
                  ),
                  [EMBED_SLUGS]: transformer.markdown(
                    content,
                    absPath,
                    { noCache: true },
                  ).meta.slugs,
                },
                position: node.position,
              });
          }
        }
      }
    });
  };
}
