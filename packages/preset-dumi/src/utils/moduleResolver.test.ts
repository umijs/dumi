import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import {
  getModuleResolvePath,
  getModuleResolvePkg,
  getModuleResolveContent,
} from './moduleResolver';
import ctx from '../context';

describe('moduleResolver', () => {
  beforeAll(() => {
    ctx.umi = Object.assign({}, ctx.umi, { paths: { cwd: process.cwd() } });
  });

  it('get expected 3rd-party module path', () => {
    const modulePath = getModuleResolvePath({ basePath: __dirname, sourcePath: 'js-yaml' });

    expect(modulePath).toEqual(
      slash(path.join(__dirname, '../../../../node_modules/js-yaml/index.js')),
    );
  });

  it('get expected local module path', () => {
    const modulePath = getModuleResolvePath({ basePath: __dirname, sourcePath: '../context' });

    expect(modulePath).toEqual(slash(path.join(__dirname, '../context.ts')));
  });

  it('throw error if cannot resolve module', () => {
    let error;

    try {
      getModuleResolvePath({ basePath: __dirname, sourcePath: 'nothing' });
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeUndefined();
  });

  it('get expected 3rd-party module version', () => {
    const { version } = getModuleResolvePkg({ basePath: __dirname, sourcePath: 'js-yaml' });
    const { version: expectedVersion } = require('js-yaml/package.json');

    expect(version).toEqual(expectedVersion);
  });

  it('get expected local module content', () => {
    const content = getModuleResolveContent({ basePath: __dirname, sourcePath: '../context' });
    const expectedContent = fs
      .readFileSync(path.join(__dirname, '../context.ts'), 'utf8')
      .toString();

    expect(content).toEqual(expectedContent);
  });
});
