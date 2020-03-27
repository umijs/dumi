import fs from 'fs';
import path from 'path';
import demo from '../demo';

describe('demo: 3rd-party deps', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/demo-deps.tsx');

  it('collect 3rd-party deps from demo', () => {
    const result = demo(fs.readFileSync(FILE_PATH).toString(), {
      fileAbsPath: FILE_PATH,
    });

    // compare transform content
    expect(result.dependencies['js-yaml']).not.toBeUndefined();
  });
});
