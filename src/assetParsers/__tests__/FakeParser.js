'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FakeParser = void 0;
const dist_1 = require('../../../dist');
exports.FakeParser = (0, dist_1.createApiParser)({
  filename: __filename,
  worker: class {
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
  },
  // If the worker class has no parameters
  // entryFile and resolveDir must be passed in manually.
  parseOptions: {
    entryFile: __filename,
    resolveDir: __dirname,
  },
});
