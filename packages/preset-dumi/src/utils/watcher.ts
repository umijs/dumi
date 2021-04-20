import fs from 'fs';

export interface IWatcherItem {
  listeners?: (((event: string, filename: string) => void) & { _identifier?: string })[];
  watcher: fs.FSWatcher;
}

const isDev = () => process.env.NODE_ENV === 'development' || process.env.TEST_WATCHER;
const watchers: Record<string, IWatcherItem> = {};

export const closeFileWatcher = (filePath: string) => {
  // close & remove listeners
  watchers[filePath].watcher.close();
  watchers[filePath] = null;
};

export const listenFileOnceChange = (filePath: string, listener: IWatcherItem['listeners'][0]) => {
  if (isDev()) {
    watchers[filePath] = watchers[filePath] || {
      listeners: [],
      watcher: fs.watch(filePath, (...args) => {
        const listeners = watchers[filePath].listeners;
        // close watcher if change triggered
        closeFileWatcher(filePath);
        listeners.forEach(fn => fn(...args));
      }),
    };

    const existingListenerIndex = watchers[filePath].listeners.findIndex(
      fn => (fn._identifier || listener._identifier) && fn._identifier === listener._identifier,
    );

    if (existingListenerIndex > -1) {
      watchers[filePath].listeners.splice(existingListenerIndex, 1);
    }

    watchers[filePath].listeners.push(listener);
  }
};
