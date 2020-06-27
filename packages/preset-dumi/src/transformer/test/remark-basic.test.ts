import fs from 'fs';
import path from 'path';
import transformer from '..';

describe('basic example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-basic.md');

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH).toString(), FILE_PATH);

    // compare transform content
    expect(result.content).toEqual(
      fs.readFileSync(path.join(__dirname, '../fixtures/expect/remark-basic.html')).toString(),
    );
  });
});
