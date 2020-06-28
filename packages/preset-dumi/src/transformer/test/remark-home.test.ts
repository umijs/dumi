import fs from 'fs';
import path from 'path';
import transformer from '..';

describe('home example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-home.md');

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH).toString(), FILE_PATH).meta;
    // compare transform content
    expect(result.hero).not.toBeUndefined();
    expect(result.features).not.toBeUndefined();
    expect(result.footer).not.toBeUndefined();
  });
});
