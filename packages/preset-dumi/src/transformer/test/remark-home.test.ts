import fs from 'fs';
import path from 'path';
import remark from '../remark';

describe('home example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-home.md');

  it('transform md to jsx', () => {
    const result = remark(fs.readFileSync(FILE_PATH).toString(), {
      fileAbsPath: FILE_PATH,
      strategy: 'default',
      previewLangs: [],
    }).data as any;
    // compare transform content
    expect(result.hero).not.toBeUndefined();
    expect(result.features).not.toBeUndefined();
    expect(result.footer).not.toBeUndefined();
  });
});
