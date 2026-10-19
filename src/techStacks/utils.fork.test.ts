import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const esnoPath = path.join(
  path.dirname(require.resolve('esno/package.json')),
  'esno.js',
);
const utilsPath = path.join(__dirname, 'utils.ts');
const swcPath = require.resolve('@swc/core');

interface ChildResult {
  roots: string[];
  filesBefore: { file: string; size: number; mtimeMs: number }[];
  filesAfter: { file: string; size: number; mtimeMs: number }[];
  values: { tag: string; children: string[] }[];
}

async function transformInChild(cwd: string): Promise<ChildResult> {
  const code = `
    const fs = require('fs');
    const path = require('path');
    const swc = require(${JSON.stringify(swcPath)});
    const transformSync = swc.transformSync;
    const roots = [];
    swc.transformSync = (source, options) => {
      roots.push(path.resolve(options.jsc.experimental.cacheRoot));
      return transformSync(source, options);
    };
    const { wrapDemoWithFn } = require(${JSON.stringify(utilsPath)});
    function cacheFiles(root) {
      return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(root, entry.name);
        if (entry.isDirectory()) return cacheFiles(file);
        const { size, mtimeMs } = fs.statSync(file);
        return [{ file, size, mtimeMs }];
      }).sort((a, b) => a.file.localeCompare(b.file));
    }
    async function transform(label) {
      const wrapped = wrapDemoWithFn(
        "const label: string = " + JSON.stringify(label) +
          "; export default () => <div>{label}</div>;",
        {
          filename: path.join(process.cwd(), 'index.tsx'),
          parserConfig: { syntax: 'typescript', tsx: true },
        },
      );
      const factory = new Function('React', 'return (' + wrapped + ');')({
        createElement: (tag, props, ...children) => ({ tag, children }),
      });
      return (await factory()).default();
    }
    (async () => {
      const first = await transform('first');
      const filesBefore = cacheFiles(roots[0]);
      const second = await transform('second');
      console.log(JSON.stringify({
        roots,
        filesBefore,
        filesAfter: cacheFiles(roots[1]),
        values: [first, second],
      }));
    })().catch(error => {
      console.error(error);
      process.exitCode = 1;
    });
  `;
  const { stdout } = await execFileAsync(
    process.execPath,
    [esnoPath, '--eval', code],
    { cwd, timeout: 10000 },
  );

  return JSON.parse(stdout);
}

test('concurrent demo loaders use separate reusable SWC plugin caches', async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-swc-cache-'));

  try {
    // Both children deliberately share a working directory, as loader workers do.
    const results = await Promise.allSettled([
      transformInChild(cwd),
      transformInChild(cwd),
    ]);
    const children = results.map((result) => {
      if (result.status === 'rejected') throw result.reason;
      return result.value;
    });

    children.forEach((child) => {
      expect(child.values).toEqual([
        { tag: 'div', children: ['first'] },
        { tag: 'div', children: ['second'] },
      ]);
      expect(child.roots[0]).toBe(child.roots[1]);
      expect(child.filesBefore.length).toBeGreaterThan(0);
      expect(child.filesBefore.every((file) => file.size > 0)).toBe(true);
      // Repeated demos keep the already compiled WASM module and its disk cache.
      expect(child.filesAfter).toEqual(child.filesBefore);
    });
    expect(children[0].roots[0]).not.toBe(children[1].roots[0]);
    expect(
      children[0].filesBefore.some((first) =>
        children[1].filesBefore.some((second) => second.file === first.file),
      ),
    ).toBe(false);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
