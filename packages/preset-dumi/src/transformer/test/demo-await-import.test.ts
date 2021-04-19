import fs from 'fs';
import path from 'path';
import { winPath, winEOL } from '@umijs/utils';
import demo from '../demo';
import ctx, { init } from '../../context';

describe('demo: await import', () => {
  let originalCtx: any;
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/demo-await-import.tsx');

  beforeAll(() => {
    originalCtx = ctx;
    init({ config: { dynamicImport: {} } } as any, {} as any);
  });

  afterAll(() => {
    init(originalCtx.umi, originalCtx.opts);
  });

  it('replace all import & require to await import', () => {
    const result = demo(fs.readFileSync(FILE_PATH, 'utf8').toString(), {
      isTSX: true,
      fileAbsPath: FILE_PATH,
    });

    // compare transform content
    expect(
      winEOL(
        result.content.replace(
          new RegExp(winPath(process.cwd()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          '$CWD',
        ),
      ),
    ).toEqual(
      winEOL(
        fs.readFileSync(path.join(__dirname, '../fixtures/expect/demo-await-import.js')).toString(),
      ),
    );
  });
});
