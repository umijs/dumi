import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

test('cold Markdown workers keep the TS context hook without loading server utilities', async () => {
  const cwd = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-worker-')),
  );
  const customStackPath = path.join(cwd, 'custom-stack.ts');
  const contextPath = path.join(cwd, 'loader-context.cjs');
  const utilsPath = require.resolve('@umijs/utils');
  const esbuildPath = require.resolve('@umijs/bundler-utils/compiled/esbuild');

  try {
    fs.writeFileSync(
      customStackPath,
      `export default class CustomStack {
        name: string = 'cold-worker';
        isSupported() { return false; }
        transformCode(code: string) { return code; }
      }`,
    );
    fs.writeFileSync(
      contextPath,
      `require(${JSON.stringify(
        utilsPath,
      )}).register.register({ implementor: require(${JSON.stringify(
        esbuildPath,
      )}) });
      exports.techStacks = [new (require(${JSON.stringify(
        customStackPath,
      )}).default)()];`,
    );
    const code = `
      const fs = require('fs');
      const path = require('path');
      const Module = require('module');
      const esbuild = require(${JSON.stringify(esbuildPath)});
      const resolveFilename = Module._resolveFilename;
      Module._resolveFilename = function(request, ...args) {
        if (request.startsWith('@/')) {
          request = path.join(${JSON.stringify(
            path.join(__dirname, '../..'),
          )}, request.slice(2));
        }
        return resolveFilename.call(this, request, ...args);
      };
      Module._extensions['.ts'] = (mod, filename) => {
        const { code } = esbuild.transformSync(fs.readFileSync(filename, 'utf8'), {
          loader: 'ts', format: 'cjs', target: 'node18',
        });
        mod._compile(code, filename);
      };
      const load = Module._load;
      const serverUtilities = [];
      Module._load = function(request, ...args) {
        if (request === 'umi/plugin-utils' || request === '@umijs/server' ||
            request === '@umijs/bundler-utils/compiled/express') {
          serverUtilities.push(request);
        }
        return load.call(this, request, ...args);
      };
      process.env.DUMI_CACHE = 'none';
      process.env.NODE_ENV = 'production';
      const { default: loader } = require(${JSON.stringify(
        path.join(__dirname, 'index.ts'),
      )});
      const ctx = require(${JSON.stringify(contextPath)});
      const { register, winPath } = require(${JSON.stringify(utilsPath)});
      const hookCompiledCustomStack = register.getFiles().includes(${JSON.stringify(
        customStackPath,
      )});
      register.restore();
      setImmediate(() => console.log(JSON.stringify({
        serverUtilities,
        loaderType: typeof loader,
        customStack: ctx.techStacks[0].name,
        hookCompiledCustomStack,
        normalizedPath: winPath('docs' + String.fromCharCode(92) + 'index.md'),
      })));
    `;
    const { stdout } = await execFileAsync(process.execPath, ['--eval', code], {
      cwd,
      timeout: 10000,
    });

    expect(JSON.parse(stdout)).toEqual({
      serverUtilities: [],
      loaderType: 'function',
      customStack: 'cold-worker',
      hookCompiledCustomStack: true,
      normalizedPath: 'docs/index.md',
    });
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
