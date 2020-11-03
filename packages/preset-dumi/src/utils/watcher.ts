import fs from 'fs';

interface IWatcherItem {
  options: {
    parentFilePath?: string;
    watchFilePath?: string;
    listener?: (event: string, filename: string) => void;
  };
  watcher: fs.FSWatcher;
}

const isDev = () => process.env.NODE_ENV === 'development' || process.env.TEST_WATCHER;
let watchers: IWatcherItem[] = [];

export const watchFileChange = (
  filePath: string,
  listener: IWatcherItem['options']['listener'],
): IWatcherItem => {
  if (isDev()) {
    // save watcher
    const watcher = {
      options: { watchFilePath: filePath, listener },
      watcher: fs.watch(filePath, listener),
    };
    watchers.push(watcher);

    return watcher;
  }
};

export const saveFileOnDepChange = (parentFilePath: string, depPath: string) => {
  if (isDev()) {
    const watcher = watchFileChange(depPath, () => {
      triggerFileChange(parentFilePath);
    });

    watcher.options.parentFilePath = parentFilePath;
  }
};

export const closeWatcher = (item: IWatcherItem) => {
  // close & remove watcher
  item.watcher.close();
  watchers.splice(watchers.indexOf(item), 1);
};

export const closeWatchersForFile = (filePath: string) => {
  const relatedWatchers = getWatchersForFile(filePath);

  // close all related watchers
  relatedWatchers.forEach(item => closeWatcher(item));
};

export const getWatchersForFile = (filePath: string) => {
  const result = new Set<IWatcherItem>();

  function loop(loopFilePath: string) {
    // find all related watchers, include dep file
    watchers.forEach(item => {
      if (
        (item.options.watchFilePath === loopFilePath ||
          item.options.parentFilePath === loopFilePath) &&
        !result.has(item)
      ) {
        result.add(item);

        // continue to close watcher for related files
        if (item.options.watchFilePath !== loopFilePath) {
          loop(item.options.watchFilePath);
        }
      }
    });
  }

  loop(filePath);

  return Array.from(result);
};

export const triggerFileChange = (filePath: string) => {
  fs.writeFileSync(filePath, fs.readFileSync(filePath));
};
