import { expect, test } from 'vitest';
// @ts-ignore
import { FakeParser } from './FakeParser';

test('AtomAssetsParser: create worker mode', async () => {
  const parser = FakeParser();
  const now = performance.now();
  parser.parse().then((result: any) => {
    expect(result).toStrictEqual({
      components: {},
      functions: {},
    });
  });
  await parser.destroyWorker();
  expect(performance.now() - now).toBeGreaterThan(1000);
});
