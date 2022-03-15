import fs from 'fs';
import path from 'path';
import transformer from '..';
// import { winEOL } from '@umijs/utils';

// TODO: UMI4 utils not winEOL
const isWindows =
  typeof process !== 'undefined' && process.platform === 'win32';

const winEOL = (content: string | undefined) => {
  if (typeof content !== 'string') {
    return content;
  }
  return isWindows ? content.replace(/\r/g, '') : content;
};

describe('basic example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-basic.md');

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH, 'utf8').toString(), FILE_PATH);

    // compare transform content
    expect(winEOL(result.content)).toEqual(
      winEOL(
        fs
          .readFileSync(path.join(__dirname, '../fixtures/expect/remark-basic.html'), 'utf8')
          .toString(),
      ),
    );
  });
});
