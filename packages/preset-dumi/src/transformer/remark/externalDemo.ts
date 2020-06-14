import fs from 'fs';
import visit from 'unist-util-visit';
import ctx from '../../context';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import transformer, { TransformResult } from '../index';
import { addDemoRoute } from '../../routes/getDemoRoutes';
import { saveFileOnDepChange, closeWatchersForFile } from '../../utils/watcher';

const DEMO_TOKEN_EXP = /<(code) ([^>]+?)\/?>/;

/**
 * simple parser for parse HTML attributes
 * @param str   attributes string on HTML tag
 */
export function HTMLAttrParser(str: string): { [key: string]: any } {
  const attrs = {};

  (str || '').replace(/([^=\s]+)(="([^"]+)"|='([^']+)')?/g, (_, name, content, value1, value2) => {
    attrs[name] = content ? value1 || value2 : true;

    // try to parse JSON field value
    if (/^(\[|{)[^]*(]|})$/.test(attrs[name])) {
      try {
        attrs[name] = JSON.parse(attrs[name]);
      } catch (err) {
        /* nothing */
      }
    }

    return _;
  });

  return attrs;
}

export default function externalDemo() {
  // clear exist watchers, use for unlink some demo from md file
  closeWatchersForFile(this.data('fileAbsPath'));

  return ast => {
    visit(ast, 'html', (node, i, parent) => {
      if (typeof node.value === 'string') {
        // split multiple code tag
        const tags = node.value.match(/<code.*?(<\/code>|\/?>)/g);
        const demos = [];

        (tags || []).forEach(tag => {
          const matches = tag.match(DEMO_TOKEN_EXP) || [];
          const { src, ...inheritAttrs } = HTMLAttrParser(matches[2]);

          if (src) {
            let absPath = getModuleResolvePath({
              basePath: this.data('fileAbsPath'),
              sourcePath: src,
              extensions: ['.tsx', '.jsx'],
            });
            const lang = absPath.match(/\.(\w+)$/)[1];

            // read external demo content and convert node to demo node
            const result: TransformResult = transformer[lang](fs.readFileSync(absPath).toString());

            // add single route for external demo
            inheritAttrs.path = addDemoRoute(absPath);

            demos.push({
              type: 'demo',
              lang,
              value: result.content,
              filePath: absPath,
              meta: {
                ...inheritAttrs,
                ...result.config,
              },
            });

            saveFileOnDepChange(this.data('fileAbsPath'), absPath);
          } else if (matches[1]) {
            ctx.umi.logger.error(
              `[dumi]: expected a code element with valid src property but got ${node.value}`,
            );
          }
        });

        // replace original node with demo(s)
        if (demos.length) {
          (parent.children as any[]).splice(i, 1, ...demos);
        }
      }
    });
  };
}
