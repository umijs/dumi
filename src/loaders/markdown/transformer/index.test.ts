import type { IDumiTechStack } from '@/types';
import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';
import transformer from '.';

const CASES_DIR = path.join(__dirname, 'fixtures');
const cases = glob
  .sync('**/index.md', { cwd: CASES_DIR, deep: 3 })
  .map((file) => path.dirname(file));

class FakeTechStack implements IDumiTechStack {
  name = 'fake';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return lang === 'jsx';
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    return opts.type === 'code-block' ? "() => 'Fake'" : raw;
  }
}

for (let castPath of cases) {
  test(`markdown transformer: ${castPath}`, async () => {
    const fileAbsPath = path.join(CASES_DIR, castPath, 'index.md');
    const content = fs.readFileSync(fileAbsPath, 'utf8');
    const ret = await transformer(content, {
      techStacks: [new FakeTechStack()],
      cwd: path.dirname(fileAbsPath),
      fileAbsPath: fileAbsPath,
      resolve: { codeBlockMode: 'active', atomDirs: [], docDirs: [] },
      alias: {
        '@': __dirname,
      },
    });

    (await import(`${CASES_DIR}/${castPath}/expect.ts`)).default(ret);
  });
}
