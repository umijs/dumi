import url from 'url';
import path from 'path';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { getModuleResolvePath } from '../../utils/moduleResolver';

/**
 * remark plugin for parse embed tag to external module
 */
export default function embed() {
  return ast => {
    visit(ast, 'element', (node, i, parent) => {
      if (is(node, 'embed') && has(node, 'src')) {
        const { src } = node.properties as { [key: string]: any };
        const parsed = url.parse(src);
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: parsed.pathname,
          extensions: [],
          silent: true,
        });

        if (absPath) {
          switch (path.extname(parsed.pathname)) {
            case '.md':
            default:
              // replace original node
              (parent.children as any).splice(i, 1, {
                type: 'element',
                tagName: 'React.Fragment',
                properties: {
                  // eslint-disable-next-line no-new-wrappers
                  children: new String(
                    `require('${absPath}${
                      parsed.hash ? `?range=${parsed.hash.replace('#', '')}` : ''
                    }').default()`,
                  ),
                },
                position: node.position,
              });
          }
        }
      }
    });
  };
}
