import fs from 'fs';
import path from 'path';
import transformer from '..';

describe('basic example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-header.md');

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH).toString(), FILE_PATH);

    expect(result.meta.slugs).toEqual([
      { depth: 1, value: 'H1', heading: 'h1' },
      { depth: 2, value: 'H2', heading: 'h2' },
      {
        depth: 3,
        value: 'H3 with ',
        heading: 'h3-with',
      },
    ]);
  });
});
