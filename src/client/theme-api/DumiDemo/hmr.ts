export type DemoHMRListener = () => void;

interface DemoHMRStore {
  moduleVersions: Map<string, Map<string, string>>;
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

  return (globalStore[DEMO_HMR_STORE_KEY] ??= {
    moduleVersions: new Map(),
    revisions: new Map(),
    listeners: new Map(),
  });
}

export function registerDemoHMRModule(
  moduleId: string,
  semanticVersions: Record<string, string>,
): void {
  const store = getDemoHMRStore();
  const previousVersions = store.moduleVersions.get(moduleId);

  if (!previousVersions) {
    store.moduleVersions.set(
      moduleId,
      new Map(Object.entries(semanticVersions)),
    );
    return;
  }

  for (const [demoId, nextVersion] of Object.entries(semanticVersions)) {
    if (!previousVersions.has(demoId)) {
      previousVersions.set(demoId, nextVersion);
      continue;
    }

    if (previousVersions.get(demoId) === nextVersion) continue;

    previousVersions.set(demoId, nextVersion);
    const key = getDemoHMRKey(moduleId, demoId);
    store.revisions.set(key, (store.revisions.get(key) ?? 0) + 1);
    store.listeners.get(key)?.forEach((listener) => listener());
  }
}

export function getDemoHMRRevision(
  moduleId: string,
  demoId: string,
): number {
  return (
    getDemoHMRStore().revisions.get(getDemoHMRKey(moduleId, demoId)) ?? 0
  );
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

  delete globalStore[DEMO_HMR_STORE_KEY];
}
