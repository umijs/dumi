import fs from 'fs';
import path from 'path';
import demo from '../demo';

describe('demo: missing react', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/demo-missing-react.tsx');

  it('override react to null for throw error', () => {
    const result = demo(fs.readFileSync(FILE_PATH).toString(), {
      isTSX: true,
      fileAbsPath: FILE_PATH,
    });

    // compare transform content
    expect(result.content).toContain('var React;');
  });
});
