import OriginalCache, {
  Cache as OriginalCacheClass,
  FileSystemCache as OriginalFileSystemCache,
} from 'file-system-cache';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, expect, test } from 'vitest';
const {
  default: BundledCache,
  Cache: BundledCacheClass,
  FileSystemCache: BundledFileSystemCache,
}: typeof import('../compiled/file-system-cache') = require('../compiled/file-system-cache');

const temporaryDirs: string[] = [];

function createCaches() {
  const basePath = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-cache-compat-'));
  temporaryDirs.push(basePath);
  const options = { basePath, ns: 'md-loader', extension: 'json' };

  return {
    original: OriginalCache(options),
    bundled: BundledCache(options),
  };
}

afterEach(() => {
  temporaryDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

test('preserve the cache factory, named classes, and public methods', () => {
  const { original, bundled } = createCaches();

  expect(OriginalCacheClass).toBe(OriginalFileSystemCache);
  expect(BundledCacheClass).toBe(BundledFileSystemCache);
  expect(bundled).toBeInstanceOf(BundledFileSystemCache);
  expect(Object.getOwnPropertyNames(BundledFileSystemCache.prototype)).toEqual(
    Object.getOwnPropertyNames(OriginalFileSystemCache.prototype),
  );
  expect(BundledFileSystemCache.hashAlgorithms).toEqual(
    OriginalFileSystemCache.hashAlgorithms,
  );
  expect(bundled.path('same-key')).toBe(original.path('same-key'));
});

test('read existing cache files in both directions, including Dates and falsy values', async () => {
  const { original, bundled } = createCaches();
  const values = [
    { frontmatter: { title: '文档' }, demos: [], embeds: ['/docs/a.md'] },
    new Date('2026-10-23T00:00:00.000Z'),
    [0, false, null, ''],
    0,
    false,
    null,
    '',
  ];

  for (const [index, value] of values.entries()) {
    const originalKey = `original-${index}`;
    original.setSync(originalKey, value);
    expect(bundled.getSync(originalKey)).toEqual(value);
    expect(await bundled.get(originalKey)).toEqual(value);

    const bundledKey = `bundled-${index}`;
    await bundled.set(bundledKey, value);
    expect(original.getSync(bundledKey)).toEqual(value);
    expect(await original.get(bundledKey)).toEqual(value);
  }

  expect(bundled.getSync('missing', 'fallback')).toBe('fallback');
  expect(await bundled.get('missing', 'fallback')).toBe('fallback');
});

test('preserve TTL values and expiry behavior across cache implementations', async () => {
  const { original, bundled } = createCaches();

  for (const [writer, reader] of [
    [original, bundled],
    [bundled, original],
  ]) {
    await writer.set('expires', { title: 'expires' }, 10);
    const cacheFile = writer.path('expires');
    const stored = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    expect(stored.ttl).toBe(10);
    stored.created = '2000-01-01T00:00:00.000Z';
    fs.writeFileSync(cacheFile, JSON.stringify(stored));

    // The upstream library returns undefined for expired files, even when a
    // default value was supplied. Preserve that existing behavior exactly.
    expect(reader.getSync('expires', 'fallback')).toBeUndefined();
    expect(await reader.get('expires', 'fallback')).toBeUndefined();
  }
});

test('share asynchronous writes, bulk loading, removal, and namespace clearing', async () => {
  const { original, bundled } = createCaches();

  await original.set('first', { title: 'first' });
  expect(await bundled.fileExists('first')).toBe(true);
  await bundled.save([
    { key: 'second', value: { title: 'second' } },
    { key: 'third', value: { title: 'third' } },
  ]);

  const values = (await original.load()).files
    .map((file) => file.value.title)
    .sort();
  expect(values).toEqual(['first', 'second', 'third']);
  await bundled.remove('first');
  expect(await original.fileExists('first')).toBe(false);
  await bundled.clear();
  expect(await original.load()).toEqual({ files: [] });
});

test('preserve malformed cache errors for synchronous and asynchronous readers', async () => {
  const { original, bundled } = createCaches();
  const cacheFile = original.path('broken');
  fs.writeFileSync(cacheFile, '{');

  expect(() => original.getSync('broken')).toThrow(SyntaxError);
  expect(() => bundled.getSync('broken')).toThrow(SyntaxError);
  await expect(bundled.get('broken')).rejects.toThrow(
    `Failed to read cache value at: ${cacheFile}.`,
  );
  await expect(original.get('broken')).rejects.toThrow(
    `Failed to read cache value at: ${cacheFile}.`,
  );
});
