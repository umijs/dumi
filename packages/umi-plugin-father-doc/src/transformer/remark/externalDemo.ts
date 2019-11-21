import fs from 'fs';
import path from 'path';
import visit from 'unist-util-visit';

const DEMO_TOKEN_EXP = /^\s*<(code)[^>]+src="?([^ ">]+)"?/;

export default (options: { [key: string]: any } = {}) => (ast) => {
  visit(ast, 'html', (node) => {
    if (typeof node.value === 'string') {
      const matches = node.value.match(DEMO_TOKEN_EXP) || [];
      const demoPath = matches[2];

      if (demoPath) {
        const absPath = demoPath.startsWith('/') ? demoPath : path.join(options.fileAbsDir, demoPath);

        if (fs.existsSync(absPath)) {
          // read external demo content and convert node to previewer
          const content = fs.readFileSync(absPath).toString();

          node.type = 'previewer';
          node.lang = absPath.match(/\.(\w+)$/)[1];
          node.value = content;
          node.basePath = path.parse(absPath).dir;
        } else {
          throw new Error(`[External-Demo Error]: cannot find demo in ${absPath}`);
        }
      } else if (matches[1]) {
        throw new Error(`[External-Demo Error]: expected a code element with valid src property but got ${node.value}`);
      }
    }
  });
}
