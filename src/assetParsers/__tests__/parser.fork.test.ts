import { expect, test } from 'vitest';
import { FakeParser } from './FakeParser.js';

test('AtomAssetsParser: create worker mode', async () => {
  const parser = FakeParser();
  const now = performance.now();
  parser.parse().then((result) => {
    expect(result).toStrictEqual({
      components: {},
      functions: {},
    });
  });
  await parser.destroyWorker();
  expect(performance.now() - now).toBeGreaterThan(1000);
});
