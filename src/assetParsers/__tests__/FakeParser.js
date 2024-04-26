const { createApiParser } = require('../../../tech-stack-utils');

module.exports.FakeParser = createApiParser({
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
