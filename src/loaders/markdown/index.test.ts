import { vi } from 'vitest';
import { getMdLoaderCacheSync } from '.';

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
