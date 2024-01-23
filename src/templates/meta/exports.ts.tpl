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

const demoIdMap = Object.keys(filesMeta).reduce((total, current) => {
  if (filesMeta[current].demoIndex) {
    const { ids, getter } = filesMeta[current].demoIndex;

    ids.forEach((id) => {
      total[id] = getter;
    });
  }

  return total;
}, {});

const demosCache = new Map<string, Promise<IDemoData | undefined>>();

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

/**
 * use demo data by id
 */
export function useDemo(id: string): IDemoData | undefined {
  if (!demosCache.get(id)) {
    demosCache.set(
      id,
      demoIdMap[id]?.().then(({ demos }) => {
        // expand context for omit ext
        expandDemoContext(demos[id].context);

        return demos[id];
      }),
    );
  }

  return use(demosCache.get(id)!);
}

/**
 * get all demos
 */
export async function getFullDemos() {
  const demoFilesMeta = Object.entries(filesMeta).filter(
    ([_id, meta]) => meta.demoIndex,
  );

  return Promise.all(
    demoFilesMeta.map(async ([id, meta]) => ({
      id,
      demos: (await meta.demoIndex.getter()).demos as Record<string, IDemoData>,
    })),
  ).then((ret) =>
    ret.reduce<Record<string, IDemoData>>((total, { id, demos }) => {
      Object.values(demos).forEach((demo) => {
        // set route id in runtime for reduce bundle size
        demo.routeId = id;

        // expand context for omit ext
        expandDemoContext(demo.context);
      });

      return {
        ...total,
        ...demos,
      };
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
  ? undefined | IRouteMeta
  : Promise<undefined | IRouteMeta> | undefined {
  if (filesMeta[id]) {
    const { frontmatter, toc, textGetter, tabs } = filesMeta[id];
    const routeMeta: IRouteMeta = {
      frontmatter,
      toc: toc,
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
      (total, { id, meta }) => ({
        ...total,
        [id]: meta,
      }),
      {},
    ),
  );
}
