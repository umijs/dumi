import fs from 'fs';
import path from 'path';
import analyzeDeps, { getCSSForDeps } from '../demo/dependencies';

describe('demo transformer: dependencies', () => {
  it('basic analysis', () => {
    const filePath = path.join(__dirname, '../fixtures/demo-deps/normal/index.tsx');
    const result = analyzeDeps(fs.readFileSync(filePath).toString(), {
      isTSX: true,
      fileAbsPath: filePath,
    });

    expect(result.files['normal.ts']).not.toBeUndefined();
    expect(result.dependencies['js-yaml']).not.toBeUndefined();
  });

  it('multi level', () => {
    const filePath = path.join(__dirname, '../fixtures/demo-deps/multi-levels/index.ts');
    const result = analyzeDeps(fs.readFileSync(filePath).toString(), {
      isTSX: false,
      fileAbsPath: filePath,
    });

    expect(result.files['multi.ts']).not.toBeUndefined();
    expect(result.files['level.ts']).not.toBeUndefined();
    expect(result.files['last.ts']).not.toBeUndefined();
    expect(result.dependencies['js-yaml']).not.toBeUndefined();
  });

  it('circular reference', () => {
    const filePath = path.join(__dirname, '../fixtures/demo-deps/circular/index.ts');
    const result = analyzeDeps(fs.readFileSync(filePath).toString(), {
      isTSX: false,
      fileAbsPath: filePath,
    });

    expect(result.files['circular.ts']).not.toBeUndefined();
    expect(Object.keys(result.files).length).toEqual(1);
    expect(result.dependencies['js-yaml']).not.toBeUndefined();
  });

  it('detect CSS files for dependencies', () => {
    expect(
      getCSSForDeps({
        // has css file
        antd: '*',
        katex: '*',
        // has not css file
        'js-yaml': '*',
      }),
    ).toHaveLength(2);
  });
});
