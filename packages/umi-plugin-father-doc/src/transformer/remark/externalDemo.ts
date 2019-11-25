import fs from 'fs';
import path from 'path';
import visit from 'unist-util-visit';
import transformer, { TransformResult } from '../index';

const DEMO_TOKEN_EXP = /^\s*<(code)[^>]+src="?([^ ">]+)"?/;

export default function externalDemo() {
  return (ast) => {
    visit(ast, 'html', (node) => {
      if (typeof node.value === 'string') {
        const matches = node.value.match(DEMO_TOKEN_EXP) || [];
        const demoPath = matches[2];

        if (demoPath) {
          const absPath = demoPath.startsWith('/') ? demoPath : path.join(this.data('fileAbsDir'), demoPath);

          if (fs.existsSync(absPath)) {
            const lang = absPath.match(/\.(\w+)$/)[1];
            const processer = transformer[lang];
            // read external demo content and convert node to demo node
            const result: TransformResult = transformer[lang](fs.readFileSync(absPath).toString());

            if (processer) {
              node.type = 'demo';
              node.lang = lang;
              node.value = result.content;
              node.meta = result.config;
              node.basePath = path.parse(absPath).dir;
            } else {
              throw new Error(`[External-Demo Error]: unsupported file type: ${lang}`);
            }
          } else {
            throw new Error(`[External-Demo Error]: cannot find demo in ${absPath}`);
          }
        } else if (matches[1]) {
          throw new Error(`[External-Demo Error]: expected a code element with valid src property but got ${node.value}`);
        }
      }
    });
  }
}
