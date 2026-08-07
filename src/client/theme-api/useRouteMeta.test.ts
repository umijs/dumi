import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getRouteMetaById: vi.fn(),
}));

vi.mock('dumi', () => ({
  getRouteMetaById: mocks.getRouteMetaById,
  matchRoutes: vi.fn(),
  useAppData: vi.fn(),
  useLocation: vi.fn(),
  useRouteData: vi.fn(),
}));

import { getCachedRouteMeta } from './useRouteMeta';

afterEach(() => {
  mocks.getRouteMetaById.mockReset();
});

test('prefers fresh Markdown metadata after an HMR revision', () => {
  mocks.getRouteMetaById.mockReturnValue({
    frontmatter: { description: 'fresh', title: 'Fresh title' },
    texts: [],
    toc: [{ depth: 2, id: 'fresh', title: 'Fresh heading' }],
  });

  const meta = getCachedRouteMeta(
    {
      id: 'docs/fresh-metadata',
      meta: {
        frontmatter: { group: 'Guide', title: 'Stale title' },
        texts: [],
        toc: [],
      },
    } as any,
    1,
  );

  expect(meta.frontmatter).toEqual({
    description: 'fresh',
    group: 'Guide',
    title: 'Fresh title',
  });
  expect(meta.toc).toEqual([{ depth: 2, id: 'fresh', title: 'Fresh heading' }]);
});

test('does not let an old async metadata request overwrite a newer revision', async () => {
  let resolveOldRequest!: (value: any) => void;
  let syncTitle = 'Initial title';
  const oldRequest = new Promise((resolve) => {
    resolveOldRequest = resolve;
  });

  mocks.getRouteMetaById.mockImplementation((_id, opts) =>
    opts?.syncOnly
      ? { frontmatter: { title: syncTitle }, texts: [], toc: [] }
      : oldRequest,
  );

  const route = {
    id: 'docs/async-race',
    meta: { frontmatter: { title: 'Route title' }, texts: [], toc: [] },
  } as any;
  const initial = getCachedRouteMeta(route, 0);
  let pending: Promise<unknown>;

  try {
    Reflect.get(initial, 'texts');
    throw new Error('Expected the async metadata request to suspend');
  } catch (error) {
    pending = error as Promise<unknown>;
  }

  syncTitle = 'Fresh title';
  const fresh = getCachedRouteMeta(route, 1);

  resolveOldRequest({
    frontmatter: { title: 'Stale async title' },
    texts: ['stale'],
    toc: [],
  });

  await expect(pending!).resolves.toBe(fresh);
  expect(fresh.frontmatter.title).toBe('Fresh title');
  expect(getCachedRouteMeta(route, 1)).toBe(fresh);
});
