import fs from 'fs';

export default class FileCache {
  cache: Record<string, { filePath: string; updatedTime: number; value: any }> = {};

  add(filePath: string, value: any, key?: string) {
    this.cache[key || filePath] = {
      filePath,
      value,
      updatedTime: fs.lstatSync(filePath).mtimeMs,
    };
  }

  get(key: string) {
    let result;

    if (
      this.cache[key] &&
      fs.lstatSync(this.cache[key].filePath).mtimeMs === this.cache[key].updatedTime
    ) {
      result = this.cache[key].value;
    }

    return result;
  }
}
