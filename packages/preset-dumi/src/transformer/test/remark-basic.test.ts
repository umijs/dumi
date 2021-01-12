import fs from 'fs';
import path from 'path';
import transformer from '..';
import { winEOL } from '@umijs/utils';

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
