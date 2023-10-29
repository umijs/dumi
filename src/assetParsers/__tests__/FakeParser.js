'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FakeParser = void 0;
const dist_1 = require('../../../dist');
class FakeLangParser {
  patch() {}
  parse() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          components: {},
          functions: {},
        });
      }, 1000);
    });
  }
  async destroy() {}
}
const fileName = __filename;
const dirName = __dirname;
const RemoteFakeParser = (0, dist_1.createRemoteClass)(
  fileName,
  FakeLangParser,
);
class FakeParser extends dist_1.BaseAtomAssetsParser {
  constructor() {
    super({
      entryFile: fileName,
      resolveDir: dirName,
      parser: new RemoteFakeParser(),
    });
  }
}
exports.FakeParser = FakeParser;
