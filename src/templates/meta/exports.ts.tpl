import { filesMeta, tabsMeta } from '.';
import type { IDemoData, IRouteMeta } from 'dumi/dist/client/theme-api/types';

// Copy from React official demo.
type ReactPromise<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
};

/**
 * @private Internal usage. Safe to remove
 */
export function use<T>(promise: ReactPromise<T>): T {
  if (promise.status === 'fulfilled') {
    return promise.value!;
  } else if (promise.status === 'rejected') {
    throw promise.reason;
  } else if (promise.status === 'pending') {
    throw promise;
  } else {
    promise.status = 'pending';
    promise.then(
      (result) => {
        promise.status = 'fulfilled';
        promise.value = result;
      },
      (reason) => {
        promise.status = 'rejected';
        promise.reason = reason;
      },
    );
    throw promise;
  }
}

type DemoGetter = () => Promise<{ demos: Record<string, IDemoData> }>;
type DemoIndex = {
  ids: string[];
  getter: DemoGetter;
};
type DemoIndexGetter = () => Promise<DemoIndex>;

const demoIndexes = Object.entries(filesMeta)
  .map(([id, meta]) => ({
    id,
    demoIndex: meta.demoIndex,
  }))
  .filter(
    (item): item is { id: string; demoIndex: DemoIndex } =>
      Boolean(item.demoIndex),
  );

const demoIdMap = demoIndexes.reduce<Record<string, DemoGetter>>(
  (total, { demoIndex }) => {
    if (demoIndex) {
      const { ids, getter } = demoIndex;

      ids.forEach((id) => {
        total[id] = getter;
      });
    }

    return total;
  },
  {},
);

const demosCache = new Map<string, Promise<IDemoData | undefined>>();
let demoIndexMapPromise:
  | Promise<Record<string, DemoIndexGetter | undefined>>
  | undefined;

function loadDemoIndexMap() {
  if (!demoIndexMapPromise) {
    demoIndexMapPromise = import('./demoIndex').then(
      ({ demoIndexMap }) =>
        demoIndexMap as Record<string, DemoIndexGetter | undefined>,
    );
  }

  return demoIndexMapPromise;
}

/**
 * expand context for source omit extension
 * why not do this in compile-time?
 * asset metadata also has extension and for reduce bundle size
 */
function expandDemoContext(context?: IDemoData['context']) {
  if (context) {
    Object.keys(context).forEach((src) => {
      const withoutExt = src.match(/^(.+)\.(js|jsx|ts|tsx|json)$/)?.[1];

      if (withoutExt && !context[withoutExt]) {
        context[withoutExt] = context[src];
      }
    });
  }
}

function getDemoIdCandidates(id: string) {
  const ids = [id];
  const localeLessId = id.replace(/-[a-z]{2}(?:-[A-Z]{2})?$/, '');

  if (localeLessId !== id) {
    ids.push(localeLessId);
  }

  return ids;
}

async function getDemoFromDemoIndex(
  id: string,
  demoIndexGetter: DemoIndexGetter,
) {
  const demoIndex = await demoIndexGetter();
  const demoId = getDemoIdCandidates(id).find((candidate) =>
    demoIndex.ids.includes(candidate),
  );
  const getter = demoId ? demoIndex.getter : undefined;

  if (!getter) return undefined;

  demoIdMap[id] = getter;
  const { demos } = await getter();
  const demo = demos[id] ?? demos[demoId!];

  if (!demo) return undefined;

  expandDemoContext(demo.context);
  return demo;
}

async function getDemoFromRouteIndex(id: string, routeId: string) {
  const demoIndexMap = await loadDemoIndexMap();
  const demoIndexGetter = demoIndexMap[routeId];

  if (!demoIndexGetter) return getDemoFromIndexMap(id);

  return (
    (await getDemoFromDemoIndex(id, demoIndexGetter)) ??
    getDemoFromIndexMap(id)
  );
}

async function getDemoFromIndexMap(id: string) {
  const demoIndexMap = await loadDemoIndexMap();
  const demoIndexGetters = Object.values(demoIndexMap).filter(
    (item): item is DemoIndexGetter => Boolean(item),
  );

  for (const demoIndexGetter of demoIndexGetters) {
    const demo = await getDemoFromDemoIndex(id, demoIndexGetter).catch(
      () => undefined,
    );
    if (demo) return demo;
  }
}

/**
 * use demo data by id
 */
export function useDemo(
  id: string,
  loader?: DemoGetter,
  version?: string,
  routeId?: string,
): IDemoData | undefined {
  const mappedDemoId = loader
    ? undefined
    : getDemoIdCandidates(id).find((candidate) => demoIdMap[candidate]);
  const cacheKey = version
    ? `${id}:${version}`
    : routeId
      ? `${id}:route=${routeId}`
      : id;
  const getter = loader ?? (mappedDemoId ? demoIdMap[mappedDemoId] : undefined);

  if (!demosCache.get(cacheKey)) {
    demosCache.set(
      cacheKey,
      getter
        ? getter().then(({ demos }) => {
            const demo = demos[id] ?? (mappedDemoId && demos[mappedDemoId]);
            if (!demo) return undefined;

            // expand context for omit ext
            expandDemoContext(demo.context);
            return demo;
          })
        : routeId
          ? getDemoFromRouteIndex(id, routeId)
          : getDemoFromIndexMap(id),
    );

    // Reuse local demo data for consumers that still call useDemo(id), such as useLiveDemo.
    demosCache.set(id, demosCache.get(cacheKey)!);
  }

  return use(demosCache.get(cacheKey)!);
}

/**
 * get all demos
 */
export async function getFullDemos() {
  const demoIndexMap = await loadDemoIndexMap();
  const lazyDemoIndexes = await Promise.all(
    Object.entries(demoIndexMap).map(async ([id, demoIndexGetter]) => ({
      id,
      demoIndex: await demoIndexGetter?.().catch(() => undefined),
    })),
  );
  const allDemoIndexes = [
    ...demoIndexes,
    ...lazyDemoIndexes,
  ].filter(
    (item): item is { id: string; demoIndex: DemoIndex } =>
      Boolean(item.demoIndex),
  );

  return Promise.all(
    allDemoIndexes.map(async ({ id, demoIndex }) => ({
      id,
      demos: (await demoIndex.getter()).demos as Record<string, IDemoData>,
    })),
  ).then((ret) =>
    ret.reduce<Record<string, IDemoData>>((total, { id, demos }) => {
      Object.values(demos).forEach((demo) => {
        // set route id in runtime for reduce bundle size
        demo.routeId = id;

        // expand context for omit ext
        expandDemoContext(demo.context);
      });
      Object.assign(total, demos);
      return total;
    }, {}),
  );
}

type ITab = NonNullable<IRouteMeta['tabs']>[0];

/**
 * generate final data for tab
 */
function genTab(id: string, meta?: ITab['meta']): ITab {
  return {
    ...tabsMeta[id],
    meta: meta ?? {
      frontmatter: { title: tabsMeta[id].title },
      toc: [],
      texts: [],
    },
  };
}

/**
 * get route meta by id
 */
export function getRouteMetaById<T extends { syncOnly?: boolean }>(
  id: string,
  opts?: T,
): T extends { syncOnly: true }
  ? IRouteMeta | undefined
  : Promise<IRouteMeta> | undefined {

  if (filesMeta[id]) {
    const { frontmatter, toc, textGetter, tabs } = filesMeta[id];
    const routeMeta: IRouteMeta = {
      frontmatter,
      toc,
      texts: [],
    };

    if (opts?.syncOnly) {
      if (tabs) {
        routeMeta.tabs = tabs.map((tabId) =>
          genTab(tabId, getRouteMetaById(tabId, opts)),
        );
      }
      return routeMeta;
    } else {
      return new Promise(async (resolve) => {
        if (textGetter) {
          ({ texts: routeMeta.texts } = await textGetter());
        }
        if (tabs) {
          routeMeta.tabs = await Promise.all(
            tabs.map(async (tabId) =>
              genTab(tabId, await getRouteMetaById(tabId, opts)),
            ),
          );
        }
        resolve(routeMeta);
      });
    }
  }
}

/**
 * get all routes meta
 */
export async function getFullRoutesMeta(): Promise<Record<string, IRouteMeta>> {
  return await Promise.all(
    Object.keys(filesMeta).map(async (id) => ({
      id,
      meta: await getRouteMetaById(id),
    })),
  ).then((ret) =>
    ret.reduce(
      (total, { id, meta }) => {
        total[id] = meta;
        return total;
      },
      {},
    ),
  );
}
