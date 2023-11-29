import { filesMeta, tabsMeta } from '.';
import type { IDemoData, IRouteMeta } from 'dumi/dist/client/theme-api/types';
import { use } from 'dumi/dist/client/theme-api/utils';

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
 * use demo data by id
 */
export function useDemo(id: string): IDemoData | undefined {
  if (!demosCache.get(id)) {
    demosCache.set(
      id,
      demoIdMap[id]?.().then(({ demos }) => demos[id]),
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
        demo.routeId = id;
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
export function getRouteMetaById(
  id: string,
  opts: { syncOnly: true },
): undefined | IRouteMeta;
export function getRouteMetaById(
  id: string,
  opts?: { syncOnly?: false },
): Promise<undefined | IRouteMeta>;
export function getRouteMetaById(
  id: string,
  opts?: { syncOnly?: boolean },
): Promise<undefined | IRouteMeta> | undefined | IRouteMeta {
  if (filesMeta[id]) {
    const { frontmatter, toc, textGetter, tabIds = [] } = filesMeta[id];
    const routeMeta = {
      frontmatter,
      toc: toc,
      texts: [],
    };

    if (opts?.syncOnly) {
      routeMeta.tabs = tabIds.map((tabId) =>
        genTab(tabId, getRouteMetaById(tabId, opts)),
      );
    } else {
      return new Promise(async (resolve) => {
        if (textGetter) {
          ({ texts: routeMeta.texts } = await textGetter());
        }

        routeMeta.tabs = await Promise.all(
          tabIds.map(async (tabId) =>
            genTab(tabId, await getRouteMetaById(tabId, opts)),
          ),
        );
        resolve(routeMeta);
      });
    }

    return routeMeta;
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
