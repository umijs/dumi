import fs from 'fs';
import path from 'path';
import remark from '../remark';

describe('basic example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-basic.md');

  it('transform md to jsx', () => {
    const result = remark(fs.readFileSync(FILE_PATH).toString(), {
      fileAbsPath: FILE_PATH,
      strategy: 'default',
      previewLangs: [],
    });

    // compare transform content
    expect(result.contents).toEqual(
      fs.readFileSync(path.join(__dirname, '../fixtures/expect/remark-basic.html')).toString(),
    );
  });
});
