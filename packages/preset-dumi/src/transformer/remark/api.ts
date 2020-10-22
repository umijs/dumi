import path from 'path';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import parser, { IPropDefinitions } from '../../api-parser';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { saveFileOnDepChange } from '../../utils/watcher';
import ctx from '../../context';

function applyApiData(identifier: string, definitions: IPropDefinitions) {
  if (identifier && definitions) {
    ctx.umi?.applyPlugins({
      key: 'dumi.detectApi',
      type: ctx.umi.ApplyPluginsType.event,
      args: {
        identifier,
        data: definitions,
      },
    });
  }
}

/**
 * remark plugin for parse embed tag to external module
 */
export default function embed() {
  return (ast, vFile) => {
    visit(ast, 'element', node => {
      if (is(node, 'API')) {
        let identifier: string;
        let definitions: IPropDefinitions;

        if (has(node, 'src')) {
          const src = (node.properties as any).src || '';
          // guess component name if src file is index
          const componentName =
            path.parse(src).name === 'index' ? path.basename(path.dirname(src)) : '';
          const absPath = path.join(path.dirname(this.data('fileAbsPath')), src);

          definitions = parser(absPath, componentName);
          identifier = componentName || src;

          // trigger parent markdown file change after this file changed
          saveFileOnDepChange(this.data('fileAbsPath'), absPath);
        } else if (vFile.data.componentName) {
          try {
            const sourcePath = getModuleResolvePath({
              basePath: process.cwd(),
              sourcePath: path.dirname(this.data('fileAbsPath')),
              silent: true,
            });

            definitions = parser(sourcePath, vFile.data.componentName);
            identifier = vFile.data.componentName;
          } catch (err) {
            /* noting */
          }
        }

        if (identifier && definitions) {
          // configure properties for API node
          (node.properties as any).exports = Object.keys(definitions);
          (node.properties as any).identifier = identifier;

          // apply api data
          applyApiData(identifier, definitions);
        }
      }
    });
  };
}
