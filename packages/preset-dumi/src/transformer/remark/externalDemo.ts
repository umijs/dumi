import fs from 'fs';
import { utils } from 'dumi';
import path from 'path';
import visit from 'unist-util-visit';
import resolve from 'enhanced-resolve';
import ctx from '../../context';
import transformer, { TransformResult } from '../index';
import { addDemoRoute } from '../../routes/getDemoRoutes';

const DEMO_TOKEN_EXP = /<(code) ([^>]+?)\/?>/;
const fileWatchers: { [key: string]: fs.FSWatcher[] } = {};

/**
 * simple parser for parse HTML attributes
 * @param str   attributes string on HTML tag
 */
export function HTMLAttrParser(str: string): { [key: string]: any } {
  const attrs = {};

  (str || '').replace(/([^=\s]+)(="([^"]+)")?/g, (_, name, content, value) => {
    attrs[name] = content ? value : true;

    return _;
  });

  return attrs;
}

function watchExternalDemoChange(demoPath: string, parentPath: string) {
  if (process.env.NODE_ENV === 'development') {
    // only watch under development mode
    fileWatchers[parentPath] = (fileWatchers[parentPath] || []).concat(
      fs.watch(demoPath, () => {
        // trigger parent file change to update frontmatter when demo file change
        fs.writeFileSync(parentPath, fs.readFileSync(parentPath));
      }),
    );
  }
}

export default function externalDemo() {
  // clear exist watchers, use for unlink some demo from md file
  if (fileWatchers[this.data('fileAbsPath')]) {
    fileWatchers[this.data('fileAbsPath')].forEach(watcher => {
      watcher.close();
    });

    delete fileWatchers[this.data('fileAbsPath')];
  }

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
            let absPath = utils.winPath(
              resolve.create.sync({
                extensions: ['.tsx', '.jsx'],
                alias: ctx.umi?.config?.alias || {},
              })(path.parse(this.data('fileAbsPath')).dir, src),
            );
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

            watchExternalDemoChange(absPath, this.data('fileAbsPath'));
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
