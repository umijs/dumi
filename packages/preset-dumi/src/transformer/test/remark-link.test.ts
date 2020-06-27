import fs from 'fs';
import path from 'path';
import transformer from '..';

describe('link example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-link.md');

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH).toString(), FILE_PATH).content;
    // compare transform content
    expect(result).toEqual(
      fs.readFileSync(path.join(__dirname, '../fixtures/expect/remark-link.html')).toString(),
    );
  });
});
