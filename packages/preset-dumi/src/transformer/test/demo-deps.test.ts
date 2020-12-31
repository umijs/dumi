import fs from 'fs';
import path from 'path';
import { Service } from '@umijs/core';
import { rimraf } from '@umijs/utils';
import analyzeDeps, { getCSSForDep } from '../demo/dependencies';
import ctx from '../../context';

describe('demo transformer: dependencies', () => {
  beforeAll(() => {
    ctx.umi = Object.assign({}, ctx.umi, { paths: { cwd: process.cwd() } });
  });

  it('basic analysis', () => {
    const filePath = path.join(__dirname, '../fixtures/demo-deps/normal/index.tsx');
    const result = analyzeDeps(fs.readFileSync(filePath, 'utf8').toString(), {
      isTSX: true,
      fileAbsPath: filePath,
    });

    expect(result.files['normal.ts']).not.toBeUndefined();
    expect(result.dependencies['js-yaml']).not.toBeUndefined();
  });

  it('multi level', () => {
    const filePath = path.join(__dirname, '../fixtures/demo-deps/multi-levels/index.ts');
    const result = analyzeDeps(fs.readFileSync(filePath, 'utf8').toString(), {
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
    const result = analyzeDeps(fs.readFileSync(filePath, 'utf8').toString(), {
      isTSX: false,
      fileAbsPath: filePath,
    });

    expect(result.files['circular.ts']).not.toBeUndefined();
    expect(Object.keys(result.files).length).toEqual(1);
    expect(result.dependencies['js-yaml']).not.toBeUndefined();
  });

  it("merge dep's peerDependencies", () => {
    const filePath = path.join(__dirname, '../fixtures/demo-deps/peer/index.ts');
    const result = analyzeDeps(fs.readFileSync(filePath, 'utf8').toString(), {
      isTSX: false,
      fileAbsPath: filePath,
    });

    expect(result.dependencies.typescript).not.toBeUndefined();
  });

  it('detect CSS files for dependency', () => {
    expect(typeof getCSSForDep('antd')).toEqual('string');
    expect(getCSSForDep('js-yaml')).toBeUndefined();
  });

  it('should collect local pkg as third-party dependencies', async () => {
    const service = new Service({
      cwd: path.join(__dirname, '../fixtures/demo-deps/local-pkgs'),
      presets: [require.resolve('@umijs/preset-built-in'), require.resolve('../../index.ts')],
    });

    // for package symlink
    await service.init();

    const filePath = path.join(__dirname, '../fixtures/demo-deps/local-pkgs/test.ts');
    const result = analyzeDeps(fs.readFileSync(filePath, 'utf8').toString(), {
      isTSX: false,
      fileAbsPath: filePath,
    });

    rimraf.sync(path.join(service.cwd, 'node_modules'));
    expect(result.dependencies['local-pkg']).not.toBeUndefined();
  });
});
