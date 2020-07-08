import fs from 'fs';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { parseText } from 'sylvanas';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { saveFileOnDepChange } from '../../utils/watcher';
import { addDemoRoute } from '../../routes/getDemoRoutes';
import transformer from '..';

const ATTR_MAPPING = {
  hideactions: 'hideActions',
  defaultshowcode: 'defaultShowCode',
};

/**
 * remark plugin for parse code tag to external demo
 */
export default function code() {
  return ast => {
    visit(ast, 'element', (node, i, parent) => {
      if (is(node, 'code') && has(node, 'src')) {
        const { src, ...attrs } = node.properties as { [key: string]: any };
        const absPath = getModuleResolvePath({
          basePath: this.data('fileAbsPath'),
          sourcePath: src,
          extensions: ['.tsx', '.jsx'],
        });
        const lang = absPath.match(/\.(\w+)$/)[1];

        // read external demo content and convert node to demo node
        const result = transformer.code(fs.readFileSync(absPath).toString());

        // restore camelCase attrs, because hast-util-raw will transform camlCase to lowercase
        Object.entries(ATTR_MAPPING).forEach(([mark, attr]) => {
          if (attrs[mark]) {
            attrs[attr] = attrs[mark];
            delete attrs[mark];
          }
        });

        // convert empty string to boolean
        Object.keys(attrs).forEach(attr => {
          if (attrs[attr] === '') {
            attrs[attr] = true;
          }
        });

        // add single route for external demo
        attrs.path = addDemoRoute(absPath);

        // try to parse JSON field value
        Object.keys(attrs).forEach(attr => {
          if (/^(\[|{)[^]*(]|})$/.test(attrs[attr])) {
            try {
              attrs[attr] = JSON.parse(attrs[attr]);
            } catch (err) {
              /* nothing */
            }
          }
        });

        // replace original node
        (parent.children as any).splice(i, 1, {
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
              ...attrs,
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
