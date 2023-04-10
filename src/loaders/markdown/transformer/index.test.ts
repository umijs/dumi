import type { IDumiTechStack } from '@/types';
import fs from 'fs';
import path from 'path';
import transformer from '.';

const CASES_DIR = path.join(__dirname, 'fixtures');
const cases = fs.readdirSync(CASES_DIR);

class FakeTechStack implements IDumiTechStack {
  name = 'fake';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return lang === 'jsx';
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    return opts.type === 'code-block' ? "() => 'Fake'" : raw;
  }
}

const onlyCases: string[] = [
  // fixtures/{folderName}，e.g. embed
  'embed',
];
const toBeTested = cases.filter((name) =>
  onlyCases.filter(Boolean).includes(name),
);

for (let name of toBeTested) {
  test(`markdown transformer: ${name}`, async () => {
    const fileAbsPath = path.join(CASES_DIR, name, 'index.md');
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

    (await import(`${CASES_DIR}/${name}/expect.ts`)).default(ret);
  });
}
