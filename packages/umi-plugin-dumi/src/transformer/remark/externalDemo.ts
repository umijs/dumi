import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import visit from 'unist-util-visit';
import transformer, { TransformResult } from '../index';

const DEMO_TOKEN_EXP = /<(code) ([^>]+?)\/?>/;

/**
 * simple parser for parse HTML attributes
 * @param str   attributes string on HTML tag
 */
function HTMLAttrParser(str: string): { [key: string]: any } {
  const attrs = {};

  (str || '').replace(/([^=\s]+)(="([^"]+)")?/g, (_, name, content, value) => {
    attrs[name] = content ? value : true;

    return _;
  });

  return attrs;
}

export default function externalDemo() {
  return ast => {
    visit(ast, 'html', (node, i, parent) => {
      if (typeof node.value === 'string') {
        // split multiple code tag
        const tags = node.value.match(/^\s*(<code.*?(<\/code>|\/?>))/g);
        const demos = [];

        tags?.forEach(tag => {
          const matches = tag.match(DEMO_TOKEN_EXP) || [];
          const { src, ...inheritAttrs } = HTMLAttrParser(matches[2]);

          if (src) {
            let absPath = path.isAbsolute(src)
              ? src
              : slash(path.join(this.data('fileAbsDir'), src));

            // auto complete file extension
            if (!/\.\w+$/.test(absPath)) {
              absPath = fs.existsSync(`${absPath}.jsx`) ? `${absPath}.jsx` : `${absPath}.tsx`;
            }

            if (fs.existsSync(absPath)) {
              const lang = absPath.match(/\.(\w+)$/)[1];

              if (transformer[lang]) {
                // read external demo content and convert node to demo node
                const result: TransformResult = transformer[lang](
                  fs.readFileSync(absPath).toString(),
                );

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
              } else {
                throw new Error(`[External-Demo Error]: unsupported file type: ${lang}`);
              }
            } else {
              throw new Error(`[External-Demo Error]: cannot find demo in ${absPath}`);
            }
          } else if (matches[1]) {
            throw new Error(
              `[External-Demo Error]: expected a code element with valid src property but got ${node.value}`,
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
