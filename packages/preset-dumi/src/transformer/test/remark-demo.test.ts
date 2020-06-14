import fs from 'fs';
import path from 'path';
import remark from '../remark';

describe('demo example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-demo.md');

  it('transform md to jsx', () => {
    const result = remark(fs.readFileSync(FILE_PATH).toString(), {
      fileAbsPath: FILE_PATH,
      strategy: 'default',
      previewLangs: ['jsx'],
    }).contents.toString();

    // compare transform content
    expect(result).toEqual(
      fs.readFileSync(path.join(__dirname, '../fixtures/expect/remark-demo.html')).toString(),
    );
  });
});
