import type { IDemoData } from '../types';

export type DemoHMRListener = () => void;

type DemoHMRPatch = Partial<IDemoData> & {
  __dumiOwnedPreviewerProps?: string[];
};

type DemoModule = {
  demos: Record<string, DemoHMRPatch>;
};

const DEMO_HMR_ASSET_METADATA_KEYS = [
  'description',
  'keywords',
  'snapshot',
  'title',
] as const;

/** Merge a lightweight HMR overlay into the shared demo runtime module. */
export function mergeDemoModules(
  runtimeModule: DemoModule,
  overlayModule: DemoModule,
): { demos: Record<string, IDemoData> } {
  const demos = { ...runtimeModule.demos } as Record<string, IDemoData>;

  Object.entries(overlayModule.demos).forEach(([id, overlay]) => {
    const runtime = demos[id] ?? ({} as IDemoData);
    const {
      __dumiOwnedPreviewerProps: ownedPreviewerProps = [],
      ...overlayData
    } = overlay;
    const runtimeAsset = overlay.asset ? { ...runtime.asset } : undefined;
    const runtimePreviewerProps = { ...runtime.previewerProps };

    if (runtimeAsset) {
      DEMO_HMR_ASSET_METADATA_KEYS.forEach((key) => {
        delete runtimeAsset[key];
      });
    }
    ownedPreviewerProps.forEach((key) => {
      delete (runtimePreviewerProps as Record<string, unknown>)[key];
    });

    demos[id] = {
      ...runtime,
      ...overlayData,
      ...(overlay.asset
        ? {
            asset: {
              ...runtimeAsset,
              ...overlay.asset,
            },
          }
        : {}),
      ...(overlay.previewerProps
        ? {
            previewerProps: {
              ...runtimePreviewerProps,
              ...overlay.previewerProps,
            },
          }
        : {}),
    } as IDemoData;
  });

  return { demos };
}

interface DemoHMRStore {
  moduleVersions: Map<string, Map<string, string>>;
  pendingNotifications: Map<string, ReturnType<typeof setTimeout>>;
  revisions: Map<string, number>;
  listeners: Map<string, Set<DemoHMRListener>>;
}

const DEMO_HMR_STORE_KEY = Symbol.for('dumi.demo-hmr-store');

function getDemoHMRKey(moduleId: string, demoId: string): string {
  return JSON.stringify([moduleId, demoId]);
}

function getDemoHMRStore(): DemoHMRStore {
  const globalStore = globalThis as typeof globalThis & {
    [DEMO_HMR_STORE_KEY]?: DemoHMRStore;
  };

  const store = (globalStore[DEMO_HMR_STORE_KEY] ??= {
    moduleVersions: new Map(),
    pendingNotifications: new Map(),
    revisions: new Map(),
    listeners: new Map(),
  });

  // Keep the store compatible with a previous runtime module across HMR.
  store.pendingNotifications ??= new Map();
  return store;
}

function notifyDemoHMRListeners(store: DemoHMRStore, key: string): void {
  if (store.pendingNotifications.has(key)) return;

  const timeout = setTimeout(() => {
    store.pendingNotifications.delete(key);
    store.listeners.get(key)?.forEach((listener) => listener());
  });
  store.pendingNotifications.set(key, timeout);
}

export function registerDemoHMRModule(
  moduleId: string,
  semanticVersions: Record<string, string>,
  channel = 'default',
): void {
  const store = getDemoHMRStore();
  const previousVersions = store.moduleVersions.get(moduleId);

  if (!previousVersions) {
    store.moduleVersions.set(
      moduleId,
      new Map(
        Object.entries(semanticVersions).map(([demoId, version]) => [
          channel === 'default' ? demoId : JSON.stringify([channel, demoId]),
          version,
        ]),
      ),
    );
    return;
  }

  for (const [demoId, nextVersion] of Object.entries(semanticVersions)) {
    const versionKey =
      channel === 'default' ? demoId : JSON.stringify([channel, demoId]);

    if (!previousVersions.has(versionKey)) {
      previousVersions.set(versionKey, nextVersion);
      continue;
    }

    if (previousVersions.get(versionKey) === nextVersion) continue;

    previousVersions.set(versionKey, nextVersion);
    const key = getDemoHMRKey(moduleId, demoId);
    store.revisions.set(key, (store.revisions.get(key) ?? 0) + 1);
    // Turbopack evaluates the new self-accepted demo module while the old
    // Markdown parent can still be mounted. Notify on the next task so React
    // can dispose that stale subscription before it tries its deleted loader.
    notifyDemoHMRListeners(store, key);
  }
}

export function getDemoHMRRevision(moduleId: string, demoId: string): number {
  return getDemoHMRStore().revisions.get(getDemoHMRKey(moduleId, demoId)) ?? 0;
}

export function subscribeDemoHMR(
  moduleId: string,
  demoId: string,
  listener: DemoHMRListener,
): () => void {
  const store = getDemoHMRStore();
  const key = getDemoHMRKey(moduleId, demoId);
  let listeners = store.listeners.get(key);

  if (!listeners) {
    listeners = new Set();
    store.listeners.set(key, listeners);
  }

  const currentListeners = listeners;
  currentListeners.add(listener);

  return () => {
    currentListeners.delete(listener);
    if (currentListeners.size === 0) store.listeners.delete(key);
  };
}

export function resetDemoHMRStoreForTest(): void {
  const globalStore = globalThis as typeof globalThis & {
    [DEMO_HMR_STORE_KEY]?: DemoHMRStore;
  };

  globalStore[DEMO_HMR_STORE_KEY]?.pendingNotifications?.forEach((timeout) =>
    clearTimeout(timeout),
  );
  delete globalStore[DEMO_HMR_STORE_KEY];
}
