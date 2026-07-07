import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';

let getDemoSourceFiles: typeof import('.')['getDemoSourceFiles'];
let getMdLoaderCacheSync: typeof import('.')['getMdLoaderCacheSync'];

function registerTsResolveExtension() {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;

  extensions['.ts'] ??= extensions['.js'];
}

beforeAll(async () => {
  registerTsResolveExtension();
  ({ getDemoSourceFiles, getMdLoaderCacheSync } = await import('.'));
});

test('markdown loader reads md-loader cache', () => {
  const cache = {
    getSync: vi.fn(() => 'cached'),
  };

  expect(getMdLoaderCacheSync(cache, 'key', '')).toBe('cached');
  expect(cache.getSync).toHaveBeenCalledWith('key', '');
});

test('markdown loader treats malformed md-loader cache as missed', () => {
  const cache = {
    getSync: vi.fn(() => {
      throw new SyntaxError('Unexpected end of JSON input');
    }),
  };

  expect(getMdLoaderCacheSync(cache, 'key', 'fallback')).toBe('fallback');
});

test('markdown loader rethrows non-json cache errors', () => {
  const cache = {
    getSync: vi.fn(() => {
      throw new Error('EACCES: permission denied');
    }),
  };

  expect(() => getMdLoaderCacheSync(cache, 'key', '')).toThrow(
    'EACCES: permission denied',
  );
});

test('markdown loader tracks external demo sidecar markdown files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-source-'));
  const demoFile = path.join(dir, 'basic.tsx');
  const demoMdFile = path.join(dir, 'basic.md');

  fs.writeFileSync(demoFile, 'export default () => null;');
  fs.writeFileSync(demoMdFile, '## zh-CN\n\nDemo description');

  try {
    expect(
      getDemoSourceFiles([
        {
          id: 'button-demo-basic',
          resolveMap: {
            'index.tsx': demoFile,
          },
        } as any,
      ]),
    ).toEqual([demoFile, demoMdFile]);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
