import fs from 'fs';
import path from 'path';
import {
  watchFileChange,
  triggerFileChange,
  getWatchersForFile,
  closeWatchersForFile,
  closeWatcher,
  saveFileOnDepChange,
} from './watcher';

describe('util: watcher', () => {
  const parentPath = path.join(__dirname, './fixtures/watcher/parent.js');
  const childPath = path.join(__dirname, './fixtures/watcher/child.js');
  const otherPath = path.join(__dirname, './fixtures/watcher/other.js');

  beforeAll(() => {
    process.env.TEST_WATCHER = 'true';
  });

  afterAll(() => {
    delete process.env.TEST_WATCHER;
  });

  it('basic watch', done => {
    const watcherItem = watchFileChange(parentPath, () => {
      closeWatcher(watcherItem);
      expect(getWatchersForFile(parentPath).length).toEqual(0);
      done();
    });

    expect(getWatchersForFile(parentPath).length).toEqual(1);
    setTimeout(() => {
      triggerFileChange(parentPath);
    }, 10);
  });

  it('save on change', done => {
    const watcher = fs.watch(parentPath, () => {
      closeWatchersForFile(parentPath);
      expect(getWatchersForFile(parentPath).length).toEqual(0);
      watcher.close();
      done();
    });

    saveFileOnDepChange(parentPath, childPath);
    expect(getWatchersForFile(parentPath).length).toEqual(1);
    setTimeout(() => {
      triggerFileChange(childPath);
    }, 10);
  });

  it('clear related watcher', () => {
    saveFileOnDepChange(parentPath, childPath);
    saveFileOnDepChange(childPath, otherPath);
    expect(getWatchersForFile(parentPath).length).toEqual(2);
    expect(getWatchersForFile(parentPath).length).toEqual(2);
    expect(getWatchersForFile(childPath).length).toEqual(2);
    expect(getWatchersForFile(otherPath).length).toEqual(1);
    closeWatchersForFile(parentPath);
    expect(getWatchersForFile(parentPath).length).toEqual(0);
    expect(getWatchersForFile(childPath).length).toEqual(0);
    expect(getWatchersForFile(otherPath).length).toEqual(0);
  });
});
