import fs from 'fs';
import os from 'os';
import path from 'path';
import { getCache, resolveDumiCacheDir } from './utils';

test('dumi cache directory resolves relative to the project cwd', () => {
  const cwd = path.resolve(os.tmpdir(), 'dumi-app');

  expect(resolveDumiCacheDir(cwd)).toBe(
    path.join(cwd, 'node_modules', '.cache', 'dumi'),
  );
  expect(resolveDumiCacheDir(cwd, '../shared-cache')).toBe(
    path.resolve(cwd, '../shared-cache', 'dumi'),
  );
});

test('file-system caches are isolated by their complete base path', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-cache-path-'));
  const namespace = `session-${process.pid}-${Date.now()}`;
  const firstRoot = path.join(dir, 'first');
  const secondRoot = path.join(dir, 'second');

  try {
    const first = getCache(namespace, firstRoot) as ReturnType<
      typeof getCache
    > & { basePath: string };
    const second = getCache(namespace, secondRoot) as ReturnType<
      typeof getCache
    > & { basePath: string };

    expect(first).not.toBe(second);
    expect(first.basePath).toBe(path.join(firstRoot, namespace));
    expect(second.basePath).toBe(path.join(secondRoot, namespace));
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
