import { vi } from 'vitest';
import {
  getRouteMetaHMRRevision,
  notifyRouteMetaHMR,
  subscribeRouteMetaHMR,
} from './routeMetaHMR';

test('notifies subscribers for the updated route only', () => {
  const first = vi.fn();
  const second = vi.fn();
  const unsubscribe = subscribeRouteMetaHMR('docs/first', first);

  subscribeRouteMetaHMR('docs/second', second);
  notifyRouteMetaHMR('docs/first');

  expect(first).toHaveBeenCalledTimes(1);
  expect(second).not.toHaveBeenCalled();
  expect(getRouteMetaHMRRevision('docs/first')).toBe(1);
  expect(getRouteMetaHMRRevision('docs/second')).toBe(0);

  unsubscribe();
  notifyRouteMetaHMR('docs/first');
  expect(first).toHaveBeenCalledTimes(1);
  expect(getRouteMetaHMRRevision('docs/first')).toBe(2);
});
