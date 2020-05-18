import fs from 'fs';
import path from 'path';
import remark from '../remark';

describe('link example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-link.md');

  it('transform md to jsx', () => {
    const result = remark(fs.readFileSync(FILE_PATH).toString(), {
      fileAbsPath: FILE_PATH,
      strategy: 'default',
      previewLangs: [],
    }).contents.toString();
    // compare transform content
    expect(result).toEqual(
      fs.readFileSync(path.join(__dirname, '../fixtures/expect/remark-link.html')).toString(),
    );
  });
});
