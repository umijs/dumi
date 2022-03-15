import fs from 'fs';
import path from 'path';
// import { winEOL } from '@umijs/utils';
import ctx from '../../context';
import transformer from '..';

// TODO: UMI4 utils not winEOL
const isWindows =
  typeof process !== 'undefined' && process.platform === 'win32';

const winEOL = (content: string | undefined) => {
  if (typeof content !== 'string') {
    return content;
  }
  return isWindows ? content.replace(/\r/g, '') : content;
};
 
describe('embed md example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-embed.md');

  beforeAll(() => {
    ctx.umi = Object.assign({}, ctx.umi, {
      cwd: path.basename(FILE_PATH),
      paths: { cwd: path.basename(FILE_PATH) },
    });
  });

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH, 'utf8').toString(), FILE_PATH)
      .content;

    // compare transform content
    expect(winEOL(result).replace(/(require\(')[^]*?(\/packages)/g, '$1$2')).toEqual(
      winEOL(
        fs
          .readFileSync(path.join(__dirname, '../fixtures/expect/remark-embed.html'), 'utf8')
          .toString(),
      ),
    );
  });
});
