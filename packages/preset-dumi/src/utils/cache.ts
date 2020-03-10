import fs from 'fs';

export default class FileCache {
  cache: { [key: string]: { updatedTime: number; value: any } } = {};

  add(filePath: string, value: any) {
    this.cache[filePath] = {
      updatedTime: fs.lstatSync(filePath).mtimeMs,
      value,
    };
  }

  get(filePath: string) {
    let result;

    if (filePath && fs.lstatSync(filePath).mtimeMs === this.cache[filePath]?.updatedTime) {
      result = this.cache[filePath].value;
    }

    return result;
  }
}
